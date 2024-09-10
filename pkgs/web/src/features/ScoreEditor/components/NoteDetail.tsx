import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  getChordInversions,
  getChordDetailFromKeyValues,
  formatNote,
  getModifiedChord,
  getKeyNameByKeyValue,
  resolveNote,
  type NoteFragment,
  analysis,
  suggests,
  parseStringAsSingleChordNote,
} from "@hanakla/harnica-midi";
import { MouseEvent, ReactNode, UIEvent, memo, useMemo } from "react";
import {
  RiAddFill,
  RiArrowDownLine,
  RiArrowLeftFill,
  RiArrowRightFill,
  RiArrowUpLine,
  RiSubtractFill,
} from "react-icons/ri";
import useEvent from "react-use-event-hook";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { RiCornerRightUp } from "@/components/Icons";
import { HmAlphaDegree } from "@/components/Icons/HmAlphaDegree";
import { Tabs } from "@/components/TabBar";
import { Tooltip } from "@/components/Tooltip";
import { useTone } from "@/features/ScoreEditor/hooks/tone";
import { useI18n } from "@/locales";
import { useStableLatestRef } from "@/utils/hooks";
import { twx } from "@/utils/tw";
import { DEFAULT_KEY } from "../constants";
import { useEditorStore } from "../hooks/useEditorStore";
import { useNoteDetailStore } from "./NoteDetail.store";
import {
  OnInsertNoteAfterHandler,
  OnMoveCursorToNote,
  OnReplaceNoteHandler,
} from "./ScoreEditor/types";

type Props = {
  matchNote: NoteFragment.ChordNote;
  onReplaceNote: OnReplaceNoteHandler;
  onInsertAfterNote: OnInsertNoteAfterHandler;
  onMoveCursorToNote: OnMoveCursorToNote;
};

const TRIAD_CHORDS_ORDER: (keyof Exclude)[] = [
  "tonic",
  "secondSubDominant",
  "secondTonic",
  "subdominant",
  "dominant",
  "thirdTonic",
  "secondDominant",
];

export function NoteDetail({
  matchNote,
  onReplaceNote,
  onInsertAfterNote,
  onMoveCursorToNote,
}: Props) {
  const t = useI18n();
  const noteDetailStore = useNoteDetailStore();

  const { chord: chordData } = matchNote;
  const chordDetail = chordData.detail;

  const sampler = useTone();
  const editorStore = useEditorStore();

  const onClickSuggest = useEvent((e: MouseEvent) => {
    e.stopPropagation();

    const note = e.currentTarget.dataset.note;
    const octave = e.currentTarget.dataset.octave
      ? parseInt(e.currentTarget.dataset.octave)
      : 0;
    if (!note) return;

    const chord = parseStringAsSingleChordNote(note, currentKey)?.chord;
    if (!chord) return;

    playChord.current(chord.detail.originalChordName, octave);
  });

  const onDblClickSuggest = useEvent((e: MouseEvent) => {
    e.stopPropagation();

    const note = e.currentTarget.dataset.note;
    const octave = e.currentTarget.dataset.octave
      ? parseInt(e.currentTarget.dataset.octave)
      : 0;
    if (!note) return;

    onReplaceNote(
      matchNote.noteIndex,
      (octave === 1 ? "+" : octave === -1 ? "-" : "") + note,
    );
  });

  const onClickChordSuggest = useEvent((source: string, octave: number) => {
    const notes = parseStringAsSingleChordNote(
      (octave === 1 ? "+" : octave === -1 ? "-" : "") + source,
    );
    if (notes?.type !== "chord") return;

    playChord.current(notes?.chord.detail.originalChordName, octave);
  });

  const handleClickChordSuggest = useEvent((e: MouseEvent) => {
    const note = e.currentTarget.dataset.note;
    const octave = e.currentTarget.dataset.octave
      ? parseInt(e.currentTarget.dataset.octave)
      : 0;

    if (!note) return;

    onReplaceNote(
      matchNote.noteIndex,
      (octave === 1 ? "+" : octave === -1 ? "-" : "") + note,
    );
  });

  const handleClickMoveCursorToNote = useEvent((e) => {
    const noteIndex = parseInt(e.currentTarget.dataset.noteIndex);
    if (isNaN(noteIndex)) return;

    onMoveCursorToNote(noteIndex);
  });

  const handleClickConvertToRelative = useEvent((e: MouseEvent) => {
    e.stopPropagation();

    // const note = parseStringAsSingleChordNote(noteText);
    // if (note.type !== "note") return;
  });

  const handleClickInsertAfter = useEvent((e: MouseEvent) => {
    e.stopPropagation();

    const note = e.currentTarget.dataset.note;
    if (!note) return;

    onInsertAfterNote(matchNote.noteIndex, note);
  });

  const playChord = useStableLatestRef((chordName: string, octave: number) => {
    const normalized = parseStringAsSingleChordNote(
      chordName,
      getKeyNameByKeyValue(0),
      3 + octave,
    );

    console.log(chordName, normalized, matchNote);
    if (!normalized) return;

    // const resolved = resolveNote(
    //   matchNote,
    //   chordData.appliedKey ?? DEFAULT_KEY,
    // );
    // console.log({ normalized, resolved });
    sampler?.triggerAttackRelease(normalized.chord.keys, "1s");
  });

  const handleClickToggleNTh = useEvent((e: MouseEvent) => {
    const nth = e.currentTarget.dataset.nth;
    if (!nth) return;

    const has = chordDetail.qualities.find(
      ([n, v]) => n === "tension" && v === nth,
    );

    let next: NoteFragment.ChordNote | null;

    if (has) {
      next = getModifiedChord(chordDetail.originalChordName, {
        removeQuality: [["tension", nth]],
      });
    } else {
      next = getModifiedChord(chordDetail.originalChordName, {
        addQuality: [["tension", nth]],
      });
    }

    if (!next) return;

    const formatted = formatNote(
      {
        rootName: next.chord.detail.rootName,
        rootDegreeName: next.chord.detail.rootDegreeName,
        octave: next.chord.octave,
        qualities: next.chord.detail.qualities,
      },
      {
        degree: chordData.isDegree,
      },
    );
    onReplaceNote(matchNote.noteIndex, formatted);
    playChord.current(next.chord.detail.originalChordName, next.chord.octave);
  });

  // --- memos
  const prevNote = useMemo(() => {
    return editorStore.progression.find(
      (n): n is NoteFragment.ChordNote =>
        n.type === "chord" && n.noteIndex === matchNote.noteIndex - 1,
    );
  }, [editorStore.progression, matchNote.noteIndex]);

  const nextNote = useMemo(() => {
    return editorStore.progression.find(
      (n): n is NoteFragment.ChordNote =>
        n.type === "chord" && n.noteIndex === matchNote.noteIndex + 1,
    );
  }, [editorStore.progression, matchNote.noteIndex]);

  const noteFunctions = useMemo(() => {
    return analysis.getChordFunctionOnKey(
      chordData.detail.chordName,
      chordData.appliedKey ?? "C",
    ).data;
  }, [chordData]);

  const tdsNotes = useMemo(
    () =>
      suggests.getTDSChordsByKeyName(
        matchNote.chord.appliedKey ?? DEFAULT_KEY,
        {
          degree: chordData.isDegree,
        },
      ).data,
    [matchNote.chord.appliedKey],
  );

  const inversions = useMemo(
    // prettier-ignore
    () => ({
      "1": getChordInversions(chordDetail.rootName, 1, chordDetail.octaveValue, {degree: chordData.isDegree}),
      "2": getChordInversions(chordDetail.rootName, 2, chordDetail.octaveValue, {degree: chordData.isDegree}),
      "3": getChordInversions(chordDetail.rootName, 3, chordDetail.octaveValue, {degree: chordData.isDegree}),
      "4": getChordInversions(chordDetail.rootName, 4, chordDetail.octaveValue, {degree: chordData.isDegree}),
    }),
    [chordDetail.rootName],
  );

  const subsituations = useMemo(
    () => ({
      major: suggests.getSubstitutionChords(chordDetail.chordName, "major"),
      minor: suggests.getSubstitutionChords(chordDetail.chordName, "minor"),
    }),
    [chordDetail.chordName],
  );

  const domsForInversions = useMemo(
    () => ({
      "1": suggests.getTDSChordsByKeyName(inversions["1"].root),
      "2": suggests.getTDSChordsByKeyName(inversions["2"].root),
      "3": suggests.getTDSChordsByKeyName(inversions["3"].root),
    }),
    [inversions],
  );

  const dominants = useMemo(
    () => suggests.getTDSChordsByKeyName(chordDetail.rootName).data,
    [chordDetail],
  );

  const reverseSuggests = useMemo(
    () => ({
      forDominant: dominants
        ? suggests.getTDSChordsByKeyName(dominants.dominant.root).data
        : null,
      forSubdominant: dominants
        ? suggests.getTDSChordsByKeyName(dominants.subdominant.root).data
        : null,
    }),
    [dominants],
  );

  const asFunctionOnScales = useMemo(() => {
    return analysis.getAsFunctionOnScales(
      chordDetail.chordName,
      chordData.appliedKey ?? "C",
    ).data;
  }, [chordDetail]);

  const relationFromBefore = useMemo(() => {
    return !prevNote
      ? null
      : analysis.getRelationBetweenNotes(prevNote, matchNote).data;
  }, [prevNote, matchNote]);

  const intervals = chordData.keyValues
    .slice(1)
    .map((v, idx) => v - chordData.keyValues[idx]);

  const halfDowns = useMemo(
    () => getChordDetailFromKeyValues(chordData.keyValues.map((v) => v - 1)),
    [chordData],
  );
  const halfUps = useMemo(
    () => getChordDetailFromKeyValues(chordData.keyValues.map((v) => v + 1)),
    [chordData],
  );

  const has7th = chordDetail.qualities.find(
    ([n, v]) => n === "tension" && v === "7",
  );
  const has9th = chordDetail.qualities.find(
    ([n, v]) => n === "tension" && v === "9",
  );
  const has11th = chordDetail.qualities.find(
    ([n, v]) => n === "tension" && v === "11",
  );
  const has13th = chordDetail.qualities.find(
    ([n, v]) => n === "tension" && v === "13",
  );

  const scaleOpt = { degree: chordData.isDegree };
  const currentKey = chordData.appliedKey ?? DEFAULT_KEY;

  const scales = {
    major: suggests.getScaleChords(currentKey, "major", scaleOpt),
    minor: suggests.getScaleChords(currentKey, "minor", scaleOpt),
    harmonicMinor: suggests.getScaleChords(
      currentKey,
      "harmonicMinor",
      scaleOpt,
    ),
    melodicMinor: suggests.getScaleChords(currentKey, "melodicMinor", scaleOpt),
    harmonicMajor: suggests.getScaleChords(
      currentKey,
      "harmonicMajor",
      scaleOpt,
    ),
    pentatonic: suggests.getScaleChords(currentKey, "pentatonic", scaleOpt),
    blues: suggests.getScaleChords(currentKey, "blues", scaleOpt),
    dorian: suggests.getScaleChords(currentKey, "dorian", scaleOpt),
    phrygian: suggests.getScaleChords(currentKey, "phrygian", scaleOpt),
    lydian: suggests.getScaleChords(currentKey, "lydian", scaleOpt),
    mixolydian: suggests.getScaleChords(currentKey, "mixolydian", scaleOpt),
    locrian: suggests.getScaleChords(currentKey, "locrian", scaleOpt),
    arabian: suggests.getScaleChords(currentKey, "arabian", scaleOpt),
    hirajoshi: suggests.getScaleChords(currentKey, "hirajoshi", scaleOpt),
    shakuhachi: suggests.getScaleChords(currentKey, "shakuhachi", scaleOpt),
  };

  return (
    <div
      className="p-[12px] cursor-default bg-neutral-50 rounded-[8px] shadow-md"
      onClick={stopPropagation}
    >
      {chordDetail.warns.length > 0 && (
        <div
          css={css`
            display: flex;
            margin-bottom: 8px;
            padding: 2px 4px;
            background-color: rgba(254, 199, 35, 0.2);
            border-radius: 4px;
          `}
          className="text-[14px]"
        >
          <div>{t("warns.title")}:&nbsp;</div>
          <div>
            {chordDetail.warns.map((w, idx) => (
              <div key={idx}>
                {idx + 1}. {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-[4px] mb-[8px] text-sm">
        <Button $size="sm">
          {/* <RiArrowUpDownLine
    fontSize={14}
    onClick={handleClickConvertToRelative}
  /> */}
          <HmAlphaDegree fontSize={16} />
        </Button>

        <div className="h-full border-r-[1px] border-neutral-300">&zwnj;</div>

        <div className="flex items-center gap-[4px]">
          <Button $size="sm">
            <RiArrowDownLine
              fontSize={14}
              onClick={onClickSuggest}
              onDoubleClick={onDblClickSuggest}
              data-note={
                matchNote.chord.isDegree
                  ? halfDowns.degreeName
                  : halfDowns.chordName
              }
            />
          </Button>
          {t("noteDetail.semitone")}
          <Button $size="sm">
            <RiArrowUpLine
              fontSize={14}
              onClick={onClickSuggest}
              onDoubleClick={onDblClickSuggest}
              data-note={
                matchNote.chord.isDegree
                  ? halfUps.degreeName
                  : halfUps.chordName
              }
            />
          </Button>
        </div>

        <div className="h-full border-r-[1px] border-neutral-300">&zwnj;</div>

        <Button
          $size="sm"
          $kind={has7th ? "primary" : void 0}
          className="!px-[8px]"
          onClick={handleClickToggleNTh}
          data-nth="7"
        >
          7
        </Button>
        <Button
          $size="sm"
          $kind={has9th ? "primary" : void 0}
          className="!px-[8px]"
          onClick={handleClickToggleNTh}
          data-nth="9"
        >
          9
        </Button>
        <Button
          $size="sm"
          $kind={has11th ? "primary" : void 0}
          className="!px-[8px]"
          onClick={handleClickToggleNTh}
          data-nth="11"
        >
          11
        </Button>
        <Button
          $size="sm"
          $kind={has13th ? "primary" : void 0}
          className="!px-[8px]"
          onClick={handleClickToggleNTh}
          data-nth="13"
        >
          13
        </Button>
      </div>

      <div className="mb-[16px]">
        <div className="flex mb-[4px]">
          {prevNote && (
            <span className="inline-flex items-center select-none">
              <Button
                $kind="none"
                onClick={handleClickMoveCursorToNote}
                data-note-index={prevNote.noteIndex}
              >
                <RiArrowLeftFill
                  fontSize={14}
                  className="inline text-neutral-400 mx-[4px]"
                />
              </Button>

              <Button
                $kind="none"
                className="inline-block p-[0px_2px] min-w-[40px] text-[14px] bg-neutral-200 text-neutral-600 text-center rounded-[4px] cursor-pointer"
                onClick={onClickSuggest}
                data-note={prevNote.chord.detail.chordName}
                onDoubleClick={handleClickMoveCursorToNote}
                data-note-index={prevNote.noteIndex}
              >
                {prevNote.chord.detail.originalChordName}
              </Button>

              <span className="inline-flex mx-[8px] gap-[4px]">
                {relationFromBefore?.isStrongProgression && (
                  <Tooltip content={t("noteDetail.rel.strongProgression")}>
                    <RelLabelSpan>
                      {t("noteDetail.rel.strongProgression_abbre")}
                    </RelLabelSpan>
                  </Tooltip>
                )}
                {relationFromBefore?.isDominantMotion && (
                  <Tooltip content={t("noteDetail.rel.dominantMotion")}>
                    <RelLabelSpan>
                      {t("noteDetail.rel.dominantMotion_abbre")}
                    </RelLabelSpan>
                  </Tooltip>
                )}
              </span>
            </span>
          )}

          {nextNote && (
            <span className="flex ml-auto items-center select-none">
              <Button
                $kind="none"
                className="inline-block p-[0px_2px] min-w-[40px] text-[14px] bg-neutral-200 text-neutral-600 text-center rounded-[4px] cursor-pointer"
                onClick={onClickSuggest}
                data-note={nextNote.chord.detail.chordName}
                onDoubleClick={handleClickMoveCursorToNote}
                data-note-index={nextNote.noteIndex}
              >
                {nextNote.chord.detail.originalChordName}
              </Button>

              <Button
                $kind="none"
                onClick={handleClickMoveCursorToNote}
                data-note-index={nextNote.noteIndex}
              >
                <RiArrowRightFill
                  fontSize={14}
                  className="inline text-neutral-400 mx-[4px]"
                />
              </Button>
            </span>
          )}
        </div>

        <div className="flex mb-[16px]">
          <Button
            $kind="none"
            className="mx-auto"
            onClick={onClickSuggest}
            data-note={chordDetail.originalChordName}
            data-octave={chordData.octave}
          >
            <ChordTip $kind="primary" className="!text-[18px]">
              {chordDetail.originalChordName} (
              {chordData.keys.map((key, idx, arr) => (
                <span key={key} style={{ position: "relative" }}>
                  {key}
                  {idx !== 0 && (
                    <IntervalSpan>→{intervals[idx - 1]}</IntervalSpan>
                  )}
                  {idx !== arr.length - 1 ? ", " : ""}
                </span>
              ))}
              )
            </ChordTip>
          </Button>
        </div>

        <div className="text-[12px]">
          {t("noteDetail.noteIs")}: {chordDetail.chordName} / Key:{" "}
          {chordData.appliedKey ?? "(none)"}
        </div>
      </div>

      <Tabs.Root
        defaultPage="tds"
        activePage={noteDetailStore.activeTab}
        onTabChange={noteDetailStore.setActiveTab}
      >
        <Tabs.TabBar className="justify-start">
          <Tabs.Tab name="tds">TDS</Tabs.Tab>
          {/* <Tabs.Tab name="next">展開</Tabs.Tab> */}
          <Tabs.Tab name="next">展開</Tabs.Tab>
          <Tabs.Tab name="inversion">転回形</Tabs.Tab>
          <Tabs.Tab name="scale">スケール</Tabs.Tab>
          <Tabs.Tab name="on-scale">オンスケール</Tabs.Tab>
        </Tabs.TabBar>

        <Tabs.TabPage name="tds">
          <Heading>
            {t("noteDetail.titles.keyedChords")} / 代理コード (Key:
            {chordData.appliedKey}){" "}
          </Heading>
          <ul>
            {noteFunctions &&
              tdsNotes &&
              TRIAD_CHORDS_ORDER.map((_key) => {
                return (
                  <TipItemLI key={_key}>
                    <ChordSuggest
                      label={t(`noteFunctions.${_key}`)}
                      description={<>({tdsNotes[_key].keys.join(", ")})</>}
                      chord={tdsNotes[_key].chordName}
                      octave={tdsNotes[_key].relativeOctave}
                      onClickListen={onClickChordSuggest}
                      onClickReplace={handleClickChordSuggest}
                      onClickInsertNoteAfter={handleClickInsertAfter}
                      highlight={noteFunctions[_key] ? "green" : false}
                    />
                  </TipItemLI>
                );
              })}
          </ul>
        </Tabs.TabPage>

        <Tabs.TabPage name="sdc">
          <Heading>
            {t("noteDetail.titles.subsituations")} ({chordDetail.chordName}){" "}
          </Heading>

          {Object.entries(subsituations).map(([key, subs]) => (
            <>
              {key} :
              <ul
                css={css`
                  display: flex;
                  flex-flow: column;
                  gap: 4px;
                `}
              >
                {Object.entries(subs).map(([k, sub]) => (
                  <TipItemLI key={k}>
                    <ChordSuggest
                      label={`${key}`}
                      description={<>({sub!.keys.join(", ")})</>}
                      chord={sub!.chordName}
                      onClickListen={onClickChordSuggest}
                      onClickReplace={handleClickChordSuggest}
                      onClickInsertNoteAfter={handleClickInsertAfter}
                    />
                  </TipItemLI>
                ))}
              </ul>
            </>
          ))}
        </Tabs.TabPage>

        <Tabs.TabPage name="next">
          <Heading>{t("noteDetail.titles.note")}</Heading>
          <ul
            css={css`
              display: flex;
              flex-flow: column;
              gap: 6px;
            `}
          >
            <TipItemLI>
              <ChordSuggest
                label="dom"
                description={<>({dominants?.dominant.keys.join(", ")})</>}
                chord={dominants?.dominant.chordName}
                octave={dominants?.dominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={handleClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>

            <TipItemLI
              indent={1}
              style={{
                display: "flex",
                gap: 4,
              }}
            >
              <ChordSuggest
                label="dom"
                chord={reverseSuggests.forDominant?.dominant.chordName}
                octave={reverseSuggests.forDominant?.dominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={handleClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />

              <ChordSuggest
                label="sub"
                chord={reverseSuggests.forDominant?.subdominant.chordName}
                octave={reverseSuggests.forDominant?.subdominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={handleClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>

            <TipItemLI>
              <ChordSuggest
                label="sub"
                description={<>({dominants?.subdominant.keys.join(", ")})</>}
                chord={dominants?.subdominant.chordName}
                octave={dominants?.subdominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={handleClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>

            <TipItemLI
              indent={1}
              style={{
                display: "flex",
                gap: 4,
              }}
            >
              <ChordSuggest
                label="dom"
                chord={reverseSuggests.forSubdominant?.dominant.chordName}
                octave={reverseSuggests.forSubdominant?.dominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={handleClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />

              <ChordSuggest
                label="sub"
                chord={reverseSuggests.forSubdominant?.subdominant.chordName}
                octave={
                  reverseSuggests.forSubdominant?.subdominant.relativeOctave
                }
                onClickListen={onClickChordSuggest}
                onClickReplace={handleClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>
            {/* <TipItemLI>
              <ChordSuggest
                label="7th"
                description={
                  <>({dominants?.seventhdominant.keys.join(", ")})</>
                }
                chord={dominants?.seventhdominant.chordName}
                octave={dominants?.seventhdominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={onDblClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>
            <TipItemLI>
              <ChordSuggest
                label="9th"
                description={<>({dominants?.ninthdominant.keys.join(", ")})</>}
                chord={dominants?.ninthdominant.chordName}
                octave={dominants?.ninthdominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={onDblClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>
            <TipItemLI>
              <ChordSuggest
                label="11th"
                description={
                  <>({dominants?.eleventhdominant.keys.join(", ")})</>
                }
                chord={dominants?.eleventhdominant.chordName}
                octave={dominants?.eleventhdominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={onDblClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI>
            <TipItemLI>
              <ChordSuggest
                label="13th"
                description={
                  <>({dominants?.thirteenthdominant.keys.join(", ")})</>
                }
                chord={dominants?.thirteenthdominant.chordName}
                octave={dominants?.thirteenthdominant.relativeOctave}
                onClickListen={onClickChordSuggest}
                onClickReplace={onDblClickChordSuggest}
                onClickInsertNoteAfter={handleClickInsertAfter}
              />
            </TipItemLI> */}
          </ul>
        </Tabs.TabPage>

        <Tabs.TabPage name="inversion">
          <Heading>
            {t("noteDetail.titles.inversions")} ({chordDetail.chordName}){" "}
          </Heading>
          <ul>
            {Object.entries(inversions).map(([key, inv]) => (
              <TipItemLI key={key}>
                <ChordSuggest
                  label={`inv ${key}`}
                  description={<>({inv!.keys.join(", ")})</>}
                  chord={inv!.chordName}
                  onClickListen={onClickChordSuggest}
                  onClickReplace={handleClickChordSuggest}
                  onClickInsertNoteAfter={handleClickInsertAfter}
                />
              </TipItemLI>
            ))}
          </ul>

          {/* {domsForInversions[key] && (
                  <TipItemLI
                    indent={1}
                    style={{
                      display: "flex",
                      gap: 4,
                    }}
                  >
                    <ChordSuggest
                      label="dom"
                      chord={domsForInversions[key].dominant.chordName}
                      baseKey={currentKey}
                      onClickListen={onClickChordSuggest}
                      onClickReplace={onDblClickChordSuggest}
                      onClickInsertNoteAfter={handleClickInsertAfter}
                    />
                    <ChordSuggest
                      label="sub"
                      chord={domsForInversions[key].subdominant.chordName}
                      baseKey={currentKey}
                      onClickListen={onClickChordSuggest}
                      onClickReplace={onDblClickChordSuggest}
                      onClickInsertNoteAfter={handleClickInsertAfter}
                    />
                  </TipItemLI>
                )} */}
        </Tabs.TabPage>

        <Tabs.TabPage name="scale">
          <Heading>Scales ({chordData.appliedKey ?? DEFAULT_KEY})</Heading>

          <div>
            {Object.entries(scales).map(([key, scale]) => (
              <div key={key} className="flex gap-[4px]">
                <span className="inline-flex items-center w-[8px] mr-[2px]">
                  {key === "major" && chordDetail.appliedKey?.major && (
                    <HighlightMark $kind="green" />
                  )}
                  {key === "minor" && chordDetail.appliedKey?.minor && (
                    <HighlightMark $kind="green" />
                  )}
                </span>
                {key}:
                {scale.map((suggest, idx) => (
                  <ChordSuggest
                    key={idx}
                    minimal
                    label={suggest.chordName}
                    chord={suggest.chordName}
                    baseKey={currentKey}
                    octave={suggest.relativeOctave}
                    onClickListen={onClickChordSuggest}
                    onClickReplace={handleClickChordSuggest}
                    onClickInsertNoteAfter={handleClickInsertAfter}
                  />
                ))}
              </div>
            ))}
          </div>
        </Tabs.TabPage>

        <Tabs.TabPage name="on-scale">
          <Heading>
            Function As-on ({chordData.appliedKey ?? DEFAULT_KEY})
          </Heading>

          {asFunctionOnScales &&
            Object.entries(asFunctionOnScales).map(([key, funcs]) => (
              <div key={key} className="flex items-center gap-[6px]">
                <span className="inline-flex w-[8px]">
                  <HighlightMark
                    $kind={
                      key === chordDetail.appliedKey?.key ? "green" : false
                    }
                  />
                </span>
                <div>
                  on {key}:{" "}
                  {funcs.map((func) => (
                    <Badge key={func}>{t(`noteFunctions.${func}`)}</Badge>
                  ))}
                </div>
              </div>
            ))}
        </Tabs.TabPage>
      </Tabs.Root>

      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        `}
      >
        <ul
          css={css`
            display: flex;
            flex-flow: column;
            gap: 4px;
          `}
        ></ul>
      </div>
      <FlexBreak />
    </div>
  );
}

const ChordSuggest = ({
  minimal,
  label,
  description,
  chord,
  octave,
  onClickListen,
  onClickReplace,
  onClickInsertNoteAfter,
  highlight,
}: {
  minimal?: boolean;
  label: ReactNode;
  description?: ReactNode;
  chord?: string;
  octave?: number;
  highlight?: "green" | "yellow" | false;
  onClickListen: (note: string, octave: number) => void;
  onClickReplace: (e: MouseEvent) => void;
  onClickInsertNoteAfter: (e: MouseEvent) => void;
}) => {
  const handleClickListen = useEvent((e: MouseEvent) => {
    e.stopPropagation();
    onClickListen(
      e.currentTarget.dataset.note!,
      e.currentTarget.dataset.octave
        ? parseInt(e.currentTarget.dataset.octave!)
        : 0,
    );
  });

  const handleClickReplace = useEvent((e: MouseEvent) => {
    e.stopPropagation();
    onClickReplace(e);
  });

  const minusOctave = useMemo(
    () => (chord ? getModifiedChord(chord, { octave: -1 }) : null),
    [chord],
  );

  const plusOctave = useMemo(
    () => (chord ? getModifiedChord(chord, { octave: 1 }) : null),
    [chord],
  );

  if (!chord) return null;

  return (
    <div className="inline-block" onClick={handleClickListen} data-note={chord}>
      <div
        css={css`
          display: flex;
          vertical-align: bottom;
          align-items: center;
        `}
      >
        {!minimal && <HighlightMark $kind={highlight} className="mr-[4px]" />}

        {!minimal && (
          <SuggestLabelSpan className="mr-[4px]">{label}</SuggestLabelSpan>
        )}

        {!minimal && (
          <>
            <Button
              $kind="none"
              $size="icon"
              className="!p-[2px_0px]"
              disabled={!minusOctave}
            >
              <RiSubtractFill
                fontSize={12}
                onClick={handleClickListen}
                data-note={minusOctave?.match.string}
              />
            </Button>
            <Button
              $kind="none"
              $size="icon"
              className="!p-[2px_0px]"
              disabled={!plusOctave}
            >
              <RiAddFill
                fontSize={12}
                onClick={handleClickListen}
                data-note={plusOctave?.match.string}
              />
            </Button>
          </>
        )}

        <ChordTip
          onDoubleClick={minimal ? handleClickReplace : undefined}
          data-note={chord}
          data-octave={octave}
        >
          {chord}
          {description}
        </ChordTip>

        {!minimal && (
          <>
            <TipItemRight>
              <Button $size="sm">
                <RiCornerRightUp
                  fontSize={14}
                  onClick={handleClickReplace}
                  data-note={chord}
                  data-octave={octave}
                />
              </Button>
              <Button $size="sm">
                <RiArrowRightFill
                  fontSize={14}
                  onClick={onClickInsertNoteAfter}
                  data-note={chord}
                  data-octave={octave}
                />
              </Button>
            </TipItemRight>
          </>
        )}
      </div>
    </div>
  );
};

const RelLabelSpan = memo(function RelLabelSpan({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="inline-block p-[0_4px] rounded-[4px] text-[12px] bg-neutral-200">
      {children}
    </span>
  );
});

const HighlightMark = memo(function HighlightMark({
  $kind,
  className,
}: {
  $kind?: "green" | "yellow" | "gray" | false;
  className?: string;
}) {
  return (
    <div
      className={twx("w-[8px] h-[8px] rounded-[8px]", className)}
      style={
        $kind === "green"
          ? {
              backgroundColor: "rgba(104, 237, 42, 0.8)",
            }
          : $kind === "yellow"
            ? {
                backgroundColor: "rgba(250, 183, 58, 0.8)",
              }
            : { backgroundColor: "rgba(0, 0, 0, 0.15)" }
      }
    />
  );
});

const FlexBreak = styled.div`
  flex-basis: 100%;
  height: 0;
`;

const TipItemLI = styled.li`
  /* display: flex; */

  ${(p) =>
    p.indent &&
    css`
      padding-left: ${p.indent * 12}px;
    `}
`;

const IndentDiv = styled.div`
  ${(p) =>
    p.indent &&
    css`
      padding-left: ${p.indent * 8}px;
    `}
`;

const TipItemRight = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
  text-align: right;
`;

const IntervalSpan = styled.span`
  position: absolute;
  left: 0;
  top: 100%;
  font-size: 14px;
  background-color: #359b94;
  color: #fff;
`;

const ChordTip = styled.div`
  display: inline-block;
  min-width: 16px;
  padding: 2px 4px;
  background-color: #eaeaea;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  line-height: 1;

  ${(p) =>
    p.$kind === "primary" &&
    css`
      background-color: #359b94;
      color: #fff;
    `}
`;

const stopPropagation = (e: UIEvent) => {
  e.stopPropagation();
};

const SuggestLabelSpan = styled.span`
  display: inline-block;
  min-width: 20px;
  font-size: 12px;
  text-align: right;
`;

const Heading = styled.h2`
  margin-top: 4px;
  font-size: 14px;
  font-weight: bold;
`;
