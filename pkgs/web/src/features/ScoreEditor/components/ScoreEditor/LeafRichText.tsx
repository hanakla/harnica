import { css } from "@emotion/react";
import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import {
  analysis,
  NoteFragment,
  NoteFragmentType,
  getDegreeDetailByChordName,
} from "@hanakla/harnica-lib";
import { MouseEvent, memo, useEffect, useId, useMemo } from "react";
import useEvent from "react-use-event-hook";
import {
  ContextMenu,
  MenuItem,
  useContextMenu,
} from "@/components/ContextMenu/ContextMenu";
import { Portal } from "@/components/Portal";
import { useTone } from "@/features/ScoreEditor/hooks/tone";
import { useEditorStore } from "@/features/ScoreEditor/hooks/useEditorStore";
import { useI18n } from "@/locales";
import { useMergeRefs } from "@/utils/hooks";
import { twx } from "@/utils/tw";
import { OnInsertNoteAfterHandler, OnReplaceNoteHandler } from "./types";

type Props = {
  fragment: NoteFragment.ChordNote;
  className?: string;
  onReplaceNote: OnReplaceNoteHandler;
  onInsertAfterNote: OnInsertNoteAfterHandler;
  onRequestRelativelizeAllNotes: () => void;
};

export const LeafRichText = memo(function NoteLeaf({
  fragment,
  className,
  onReplaceNote,
  onInsertAfterNote,
  onRequestRelativelizeAllNotes,
}: Props) {
  const t = useI18n();

  const chord = fragment.chord;

  const sampler = useTone();
  const editorStore = useEditorStore();
  const contextMenuId = useId();

  const contextMenu = useContextMenu({
    id: contextMenuId,
    onContextMenu: (e, menu) => {
      menu.show({ event: e, id: contextMenuId });
    },
  });

  const alsoFloat = useFloating<HTMLElement>({
    strategy: "absolute",
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

  const onClick = useEvent((e: MouseEvent) => {
    e.preventDefault();
    sampler?.triggerAttackRelease(chord.keys, "1s");
  });

  const handleClickRelativelize = useEvent(() => {
    contextMenu.hideAll();

    const newChord = getDegreeDetailByChordName(
      chord.detail.chordName,
      chord.appliedKey ?? "C",
    )?.chordName;

    if (newChord) onReplaceNote(fragment.noteIndex, newChord);
  });

  const handleClickRelativelizeAll = useEvent(() => {
    contextMenu.hideAll();

    onRequestRelativelizeAllNotes();
  });

  useEffect(() => {
    alsoFloat.update();
  }, [alsoFloat]);

  // const prevChord = useMemo(() => {
  //   return allNotes.find(
  //     (note) =>
  //       note.type === "chord" && note.noteIndex === fragment.noteIndex - 1,
  //   )?.chord;
  // }, [fragment.noteIndex, allNotes]);

  // const prevNoteTonics = useMemo(() => {
  //   return prevChord ? getTriadsByKey(prevChord.detail.root) : null;
  // }, [prevChord]);

  const currentKey = fragment.chord.appliedKey ?? "C";

  // const harmonicKeys = useMemo(
  //   () => getTriadsByKey(currentKey, { degree: true }),
  //   [currentKey],
  // );

  // const relateByPrev = useMemo(() => {
  //   return prevChord
  //     ? Object.entries({
  //         tonic: chord?.detail.root === prevNoteTonics?.tonic.root,
  //         dominant: chord?.detail.root === prevNoteTonics?.dominant.root,
  //         subdominant:
  //           chord?.detail.root === prevNoteTonics?.subdominant.root,
  //         // "7th": note.detail.root === prevNoteTonics?.seventhdominant.root,
  //         // "9th": note.detail.root === prevNoteTonics?.ninthdominant.root,
  //         // "11th": note.detail.root === prevNoteTonics?.eleventhdominant.root,
  //         // "13th":
  //         //   note.detail.root === prevNoteTonics?.thirteenthdominant.root,
  //       })
  //         .filter(([_, v]) => v)
  //         .map(([k]) => k)
  //     : [];
  // }, [prevNoteTonics]);

  const noteFunctions = useMemo(() => {
    const functions = analysis.getChordFunctionOnKey(
      chord.detail.chordName,
      chord.appliedKey ?? "C",
    ).data;
    if (!functions) return [];

    return Object.entries(functions).filter(([k, v]) => v != false) as Array<
      [keyof typeof functions, boolean]
    >;
  }, [chord]);

  return (
    <span
      ref={rootRef}
      css={css`
        color: #3f99dd;
      `}
      style={{
        backgroundColor:
          editorStore.playingNoteIndex === fragment?.noteIndex
            ? "#69cb5e"
            : editorStore.pointedNoteIndex === fragment?.noteIndex
              ? "#f1c84b"
              : "transparent",
      }}
      className={twx(
        className,
        "relative inline-block mr-[48px] select-none leading-[1.2]",
      )}
      onContextMenu={contextMenu.handleContextEvent}
    >
      <span
        className={twx(
          "leading-none relative",
          chord.detail.warns.length > 0 &&
            "before:content-[''] before:absolute before:left-0 before:bottom-0 " +
              "before:block before:w-full before:border-b-4 before:border-[rgba(254,199,35,0.5)]",
        )}
        onClick={onClick}
      >
        {fragment.match.string}
      </span>

      <Portal containerQuery="#noteEditor">
        <div
          ref={alsoFloat.refs.setFloating}
          style={alsoFloat.floatingStyles}
          className="text-[initial] text-[10px] leading-none pointer-events-none"
          contentEditable={false}
          onMouseEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {noteFunctions.length === 0 ? (
            <span className="block opacity-40">N/A</span>
          ) : (
            noteFunctions.map(([harmFunc, isMatched]) =>
              isMatched ? (
                <span key={harmFunc} className="block font-bold">
                  🔑{t(`noteFunctions.${harmFunc}_abbre`)}
                </span>
              ) : null,
            )
          )}

          {chord.isDegree && <span>= {fragment.chord.detail.rootName}</span>}
        </div>

        <ContextMenu id={contextMenuId}>
          {!chord.isDegree && (
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
});
