import { usePlayProgress } from "@/features/ScoreEditor/hooks/playingState";
import { useTone } from "@/features/ScoreEditor/hooks/tone";
import {
  MouseEvent,
  MutableRefObject,
  memo,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { RenderLeafProps } from "slate-react";
import {
  ContextMenu,
  MenuItem,
  useContextMenu,
} from "@/components/ContextMenu/ContextMenu";
import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import { useMergeRefs } from "@/utils/hooks";
import useEvent from "react-use-event-hook";
import { Position } from "./types";
import {
  getDegreeChordName,
  NoteParseResult,
  NoteMatchFragment,
  getTriadsByKey,
  resolveNote,
} from "harnica-midi";
import { css } from "@emotion/react";
import { Portal } from "@/components/Portal";
import { NoteLeaf } from "../../types";
import { DEFAULT_KEY } from "../../constants";
import { useTranslation } from "react-i18next";

type Props = Omit<RenderLeafProps, "leaf"> & {
  leaf: NoteLeaf;
  onHoverNote: (
    note: NoteMatchFragment,
    pos: Position,
    ref: MutableRefObject<HTMLElement | null>,
  ) => void;
  onUnhoverNote: (
    note: NoteMatchFragment,
    pos: Position,
    ref: MutableRefObject<HTMLElement | null>,
  ) => void;
  onReplaceNote: (note: string, pos: Position) => void;
  onInsertAfterNote: (note: string, pos: Position) => void;
  onRequestRelativelizeAllNotes: () => void;
};

export const Leaf = memo((props: Props) => {
  const note = props.leaf.note;

  if (!props.leaf.isNote) {
    return <span {...props.attributes}>{props.children}</span>;
  } else if (props.leaf.note?.note?.type !== "note") {
    return (
      <span
        style={{
          color:
            note.note?.type === "braceBegin" || note.note?.type === "braceEnd"
              ? "#e19a27"
              : "#7fa537",
        }}
        {...props.attributes}
      >
        {props.children}
      </span>
    );
  }

  return <NoteLeaf {...props} leaf={props.leaf} />;
});

const NoteLeaf = memo(
  ({
    attributes,
    children,
    leaf,
    text,
    onHoverNote,
    onUnhoverNote,
    onReplaceNote,
    onInsertAfterNote,
    onRequestRelativelizeAllNotes,
  }: Omit<Props, "leaf"> & {
    leaf: Omit<NoteLeaf, "note"> & {
      note: Omit<NoteMatchFragment, "note"> & {
        note: NoteParseResult.Note;
      };
    };
  }) => {
    const { t } = useTranslation("common");

    const matchNote = leaf.note;
    const note = matchNote.note;
    const resolvedNote = useMemo(
      () => resolveNote(note, matchNote.data.key ?? DEFAULT_KEY),
      [note],
    );

    const sampler = useTone();
    const playProgress = usePlayProgress();
    const contextMenuId = useId();

    const lastTimerRef = useRef<number | null>(null);
    const [hover, setHover] = useState(false);

    const contextMenu = useContextMenu({
      id: contextMenuId,
      onContextMenu: (e, menu) => {
        menu.show({ event: e, id: contextMenuId });
        setHover(false);
      },
    });

    const alsoFloat = useFloating<HTMLElement>({
      strategy: "fixed",
      placement: "bottom-start",
      open: true,
      middleware: [shift(), offset(0)],
      whileElementsMounted: (...args) =>
        autoUpdate(...args, { animationFrame: true }),
    });

    const rootRef = useMergeRefs<HTMLElement | null>([
      // float.refs.setReference,
      alsoFloat.refs.setReference,
    ]);

    const onMouseEnter = useEvent((e: MouseEvent<HTMLElement>) => {
      if (lastTimerRef.current) {
        window.clearTimeout(lastTimerRef.current);
      }

      setHover(true);
      onHoverNote(matchNote, leaf.position, rootRef);
    });

    const onMouseLeave = useEvent((e: MouseEvent<HTMLElement>) => {
      lastTimerRef.current = window.setTimeout(() => {
        setHover(false);
        onUnhoverNote(matchNote, leaf.position, rootRef);
      }, 0);
    });

    const onClick = useEvent((e: MouseEvent<HTMLElement>) => {
      e.preventDefault();

      console.log({ matchNote, note, resolvedNote });
      sampler?.triggerAttackRelease(resolvedNote.keys, "1s");
    });

    const handleClickRelativelize = useEvent(() => {
      contextMenu.hideAll();

      const chord = getDegreeChordName(
        note.detail.chordName,
        note.resolveKey ?? "C",
      );

      if (chord) onReplaceNote(chord, leaf.position);
    });

    const handleClickRelativelizeAll = useEvent(() => {
      contextMenu.hideAll();

      onRequestRelativelizeAllNotes();
    });

    useEffect(() => {
      alsoFloat.update();
    }, [alsoFloat.elements.reference]);

    const prevNote = useMemo(() => {
      return leaf.progression.find(
        (prog) =>
          prog.match.note?.type === "note" &&
          prog.match.data.noteIdx === leaf.note.data.noteIdx! - 1,
      )?.match.note as NoteParseResult.Note | null;
    }, [leaf.isNote, leaf.note.data.noteIdx, leaf.progression]);

    const prevNoteTonics = useMemo(() => {
      return prevNote ? getTriadsByKey(prevNote.detail.root) : null;
    }, [prevNote]);

    const currentKey = matchNote.data.key ?? "C";

    const keyTonics = useMemo(() => getTriadsByKey(currentKey), [currentKey]);

    const relateByPrev = useMemo(() => {
      return prevNote
        ? Object.entries({
            tonic: note.detail.root === prevNoteTonics?.tonic.root,
            dominant: note.detail.root === prevNoteTonics?.dominant.root,
            subdominant: note.detail.root === prevNoteTonics?.subdominant.root,
            // "7th": note.detail.root === prevNoteTonics?.seventhdominant.root,
            // "9th": note.detail.root === prevNoteTonics?.ninthdominant.root,
            // "11th": note.detail.root === prevNoteTonics?.eleventhdominant.root,
            // "13th":
            //   note.detail.root === prevNoteTonics?.thirteenthdominant.root,
          })
            .filter(([_, v]) => v)
            .map(([k]) => k)
        : [];
    }, [prevNoteTonics]);

    const relateByKey = useMemo(() => {
      console.log({ keyTonics, root: note.detail.root });
      return Object.entries({
        tonic: note.detail.root === keyTonics?.tonic.root,
        dominant: note.detail.root === keyTonics?.dominant.root,
        subdominant: note.detail.root === keyTonics?.subdominant.root,
        secondSubdominant:
          note.detail.root === keyTonics?.secondSubdominant.root,
        thirdTonic: note.detail.root === keyTonics?.thirdTonic.root,
        seventhDominant: note.detail.root === keyTonics?.seventhDominant.root,
        sixthTonic: note.detail.root === keyTonics?.sixthTonic.root,
      })
        .filter(([_, v]) => v)
        .map(([k]) => k);
    }, [keyTonics]);

    return (
      <span
        ref={rootRef}
        css={css`
          position: relative;
          display: inline-block;
          margin-right: 64px;
          margin-bottom: 24px;
          color: #3f99dd;
          user-select: none;
          line-height: 1;
        `}
        style={{
          backgroundColor:
            playProgress.currentNoteIndex === leaf.note.data.noteIdx
              ? "#f1c84b"
              : "transparent",
        }}
        {...attributes}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={contextMenu.handleContextEvent}
      >
        <span
          css={css`
            line-height: 1;
          `}
          onClick={onClick}
        >
          {children}
        </span>

        {note.detail.warns.length > 0 && (
          <span
            css={css`
              position: absolute;
              left: 0;
              bottom: 0;
              display: block;
              width: 100%;
              border-bottom: 4px solid rgba(254, 199, 35, 0.5);
            `}
          />
        )}

        <Portal>
          <div
            ref={alsoFloat.refs.setFloating}
            css={css`
              color: initial;
              font-size: 10px;
              line-height: 1;
            `}
            style={alsoFloat.floatingStyles}
            contentEditable={false}
          >
            {/* {relateByPrev.length > 0 && <span>→{relateByPrev.join(", ")}</span>} */}

            {relateByKey.length > 0 && (
              <span>
                {" "}
                🔑{" "}
                {relateByKey.map((key) => t(`noteRelations.${key}`)).join(", ")}
              </span>
            )}

            <span>
              {(relateByPrev.length > 0 || relateByKey.length > 0) && <br />}={" "}
              {resolvedNote.detail.root}
            </span>
          </div>

          <ContextMenu id={contextMenuId}>
            {!note.isDegree && (
              <MenuItem onClick={handleClickRelativelize}>
                Relativelize this note
              </MenuItem>
            )}
            <MenuItem onClick={handleClickRelativelizeAll}>
              Relativelize all notes
            </MenuItem>
          </ContextMenu>
        </Portal>
      </span>
    );
  },
);



