import { useMediaQuery } from "@chakra-ui/react";
import { useModalOpener } from "@fleur/mordred";
import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import {
  progressionToMidi,
  parseChordProgression,
  type NoteFragment,
  type NoteFragmentType,
  getDegreeDetailByChordName,
  beatclock,
} from "@hanakla/harnica-lib";
import { klona } from "klona";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PiMetronome } from "react-icons/pi";
import {
  RiGlobalLine,
  RiPlayFill,
  RiSave2Fill,
  RiSkipForwardFill,
  RiStopFill,
  RiVolumeMuteFill,
  RiVolumeUpFill,
} from "react-icons/ri";
import { useDrop, useToggle } from "react-use";
import useEvent from "react-use-event-hook";
import * as Tone from "tone";
import { ActionSheet } from "@/components/ActionSheet";
import { Button } from "@/components/Button";
import {
  ContextMenu,
  MenuItem,
  useContextMenu,
} from "@/components/ContextMenu/ContextMenu";
import { Input } from "@/components/Input";
import { Menubar } from "@/components/Menubar";
import { Portal } from "@/components/Portal";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Slider } from "@/components/Slider";
import { Tabs } from "@/components/TabBar";
import { useToastStore } from "@/components/Toast";
import {
  accentClickSound,
  clickSound,
  useTone,
} from "@/features/ScoreEditor/hooks/tone";
import { useEditorStore } from "@/features/ScoreEditor/hooks/useEditorStore";
import { useI18n } from "@/locales";
import AboutNotationEn from "@/locales/texts/notation.en.mdx";
import AboutNotationJa from "@/locales/texts/notation.ja.mdx";
import { CheckContentOverwrite } from "@/modals/CheckContentOverwrite";
import {
  useGlobalMousetrap,
  useSaveFilePicker,
  useStableLatestRef,
} from "@/utils/hooks";
import { replaceStrings } from "@/utils/string";
import { twx } from "@/utils/tw";
import { Markdown } from "./components/Markdown";
import { NoteDetail } from "./components/NoteDetail";
import { useNoteDetailStore } from "./components/NoteDetail.store";
import PianoRoll from "./components/PianoRoll";
import { LeafRichText } from "./components/ScoreEditor/LeafRichText";
import {
  OnInsertNoteAfterHandler,
  OnMoveCursorToNote,
  OnReplaceNoteHandler,
} from "./components/ScoreEditor/types";
import { ScorePane } from "./components/ScoresPane";
import { DEFAULT_BEATS } from "./constants";

const SIG_BEATS = 4;

const HANDLER_KEY = {
  TEXT_SAVE: "save-text",
  EXPORT_MIDI: "export-midi",
} as const;

export function ScoreEditor() {
  const router = useRouter();
  const { openModal } = useModalOpener();
  const t = useI18n();
  const tone = useTone();

  const editorStore = useEditorStore();
  const nodeDetailStore = useNoteDetailStore();
  const toastStore = useToastStore();
  const saveFilePicker = useSaveFilePicker();
  const prevPart = useRef<Tone.Part | null>(null);

  const [isNarrowScreen] = useMediaQuery("(max-width: 768px)");

  const editorRef = useRef<RichTextEditor.Handler | null>(null);

  const float = useFloating<HTMLElement>({
    strategy: "fixed",
    open: true,
    placement: "bottom-start",
    middleware: [shift(), offset({ alignmentAxis: -15 })],
    whileElementsMounted: (...args) =>
      autoUpdate(...args, { animationFrame: true }),
  });

  const [detailSheetOpened, toggleDetailSheetOpened] = useToggle(false);
  const [positionData, setPositionData] = useState<{
    caretPos: number;
    noteIdx: number | null;
    note: NoteFragment.ChordNote | null;
  } | null>({
    caretPos: 0,
    noteIdx: null,
    note: null,
  });

  const [playing, setPlaying] = useState(false);

  const contextMenuId = useId();
  const contextMenu = useContextMenu({
    onContextMenu: (event, menu) => {
      menu.show({ event, id: contextMenuId });
    },
  });

  const handlenMoseLeaveOnTip = useEvent(() => {
    float.update();
  });

  const handleReplaceNote = useEvent<OnReplaceNoteHandler>(
    (noteIndex, newNote) => {
      const note = editorStore.progression.find(
        (n) => n.noteIndex === noteIndex,
      );
      if (!note) return;

      const newValue = replaceStrings(editorStore.value, [
        {
          str: newNote,
          range: [note.match.start, note.match.start + note.match.length],
        },
      ]);
      const newProg = parseChordProgression(newValue, "C", SIG_BEATS);

      setPositionData((prev) => ({
        caretPos: prev?.caretPos ?? 0,
        noteIdx: noteIndex,
        note:
          newProg.find(
            (n): n is NoteFragment.ChordNote =>
              n.type === "chord" && n.noteIndex === noteIndex,
          ) ?? null,
      }));

      editorStore.set({
        value: newValue,
        progression: newProg,
        pointedNoteIndex: noteIndex,
      });
    },
  );

  const handleInsertNoteAfter = useEvent<OnInsertNoteAfterHandler>(
    (beforeNoteIndex, newNote) => {
      const note = editorStore.progression.find(
        (n) => n.noteIndex === beforeNoteIndex,
      );
      if (!note) return;

      const newValue = replaceStrings(editorStore.value, [
        {
          str: ` ${newNote}`,
          range: [note.match.end, note.match.end],
        },
      ]);

      const newProg = parseChordProgression(newValue, "C", SIG_BEATS);
      const createdNote = newProg.find(
        (n) => n.noteIndex === beforeNoteIndex + 1,
      );

      editorRef.current!.updateValue(newValue, {
        start: createdNote!.match.end,
        end: createdNote!.match.end,
      });

      editorStore.set({ value: newValue, progression: newProg });
    },
  );

  const handleMoveCursorToNote = useEvent<OnMoveCursorToNote>((noteIndex) => {
    const note = editorStore.progression.find((n) => n.noteIndex === noteIndex);
    if (note?.type !== "chord") return;

    setPositionData({
      caretPos: note.match.end,
      noteIdx: noteIndex,
      note,
    });

    editorRef.current?.setSelection({
      start: note.match.start,
      end: note.match.start,
    });
  });

  const handleConvertToDegreeAllNotes = useEvent(() => {
    const content = editorStore.value;

    const parsed = parseChordProgression(content);
    if (!parsed) return;

    const maps = parsed
      .map((m) => {
        if (m?.type !== "chord") return;
        if (m.chord.isDegree)
          return {
            str: m.match.string,
            range: [m.match.start, m.match.start + m.match.length] as [
              number,
              number,
            ],
          };

        const degree = getDegreeDetailByChordName(
          m.chord.detail.chordName,
          m.chord.appliedKey ?? "C",
        )?.chordName;
        if (!degree) return;

        return {
          str: degree,
          range: [m.match.start, m.match.start + m.match.length] as [
            number,
            number,
          ],
        };
      })
      .filter((v): v is Exclude => v != null);

    const converted = replaceStrings(content, maps);
    const nextProg = parseChordProgression(converted);
    const nextNote =
      positionData?.noteIdx != null
        ? (nextProg.find(
            (n): n is NoteFragment.ChordNote =>
              n.noteIndex === positionData?.noteIdx,
          ) ?? null)
        : null;

    editorRef.current?.updateValue(converted);
    editorStore.set({
      value: converted,
      progression: nextProg,
    });

    setPositionData((prev) => ({
      caretPos: prev?.caretPos ?? 0,
      noteIdx: nextNote?.noteIndex ?? null,
      note: nextNote,
    }));
  });

  const handleClickPause = useEvent(() => {
    setPlaying(false);

    editorStore.set({
      playingNoteIndex: null,
    });
    Tone.Transport.stop();
  });

  const handleClickSaveToLocalStorage = useEvent(() => {
    editorStore.set({ value: editorStore.value });
    toastStore.showToast({
      title: "とりまSaved",
      message: "Content saved to local storage",
    });
  });

  const handleClickSaveTextAs = useEvent(async () => {
    await handleClickSaveText(null, true);
  });

  const handleClickSaveText = useEvent(async (_: any, as?: boolean) => {
    const handle = await saveFilePicker.getFileHandleOrShowSaveFilePicker({
      id: HANDLER_KEY.TEXT_SAVE,
      selectRenew: as,
      blob: new Blob([editorStore.value], { type: "text/plain" }),
      suggestedName: "harnica-score.txt",
      accepts: [["text/plain", [".txt"]]],
    });

    if (!handle) return;

    const writable = await handle.createWritable({ keepExistingData: false });
    await writable.write(new TextEncoder().encode(editorStore.value));
    await writable.close();

    toastStore.showToast({
      title: `Content saved to ${handle.name}`,
      message: "Successfull",
    });
  });

  const handleClickSaveMidi = useEvent(async () => {
    const result = progressionToMidi(editorStore.value, "C", 4);

    const blob = new Blob([result.buffer], {
      type: result.mime,
    });

    const handle = await saveFilePicker.getFileHandleOrShowSaveFilePicker({
      id: HANDLER_KEY.EXPORT_MIDI,
      accepts: [["audio/midi", [".mid"]]],
    });
    if (!handle) return;

    const writable = await handle.createWritable({ keepExistingData: false });
    await writable.write(blob);
    await writable.close();

    toastStore.showToast({
      title: "MIDI export successful",
      message: "OK",
    });
  });

  const handleClickToggleMetronome = useEvent(() => {
    tone.enableMetronome = !tone.enableMetronome;
  });

  const handleClickShareOnX = useEvent(() => {
    const siteUrl = new URL(window.location.href);
    siteUrl.searchParams.set(
      "s",
      compressToEncodedURIComponent(editorStore.value),
    );

    const url = new URL("https://twitter.com/intent/tweet");
    url.searchParams.set(
      "text",
      "Harnicaで作った曲をシェアしました #harnica_score",
    );
    url.searchParams.set("url", siteUrl.toString());

    window.open(url.toString(), "_blank");
  });

  const handleClickToggleMute = useEvent(() => {
    tone.muted = !tone.muted;
  });

  const handleClickPlay = useEvent(() => {
    let currentNoteIndex = editorStore.progression.findIndex(
      (n) => n.noteIndex === positionData?.noteIdx,
    );
    if (currentNoteIndex === -1) return;

    const bpm =
      findLastFrom(
        editorStore.progression,
        currentNoteIndex,
        (n): n is NoteFragment.BPMChangeNote => n.type === "bpmChange",
      )?.bpmChange?.bpm ?? tone.bpm;

    const notes = editorStore.progression.slice(currentNoteIndex);
    const firstTimedNote = notes.find<NoteFragment.TimedNote>(
      (n): n is NoteFragment.TimedNote => n.time != null,
    );
    if (!firstTimedNote) return;

    const retimedNotes = notes.map((n) => {
      const clone = klona(n);
      if (n.time == null) return clone;

      const startAt = beatclock.subtractBeatClock(
        n.time.startAt.beatClock,
        firstTimedNote.time.startAt.beatClock,
        DEFAULT_BEATS,
      );

      clone.time = {
        ...n.time,
        startAt: {
          beatClock: startAt,
          beatClockStr: startAt.join(":"),
        },
      };

      return clone;
    });

    playProgression.current(retimedNotes, {
      bpm,
    });

    function findLastFrom<S extends T, T>(
      arr: T[],
      fromIndex: number,
      predicate: (v: T) => v is S,
    ): S | null {
      for (let i = fromIndex; i >= 0; i--) {
        if (predicate(arr[i])) return arr[i] as S;
      }
      return null;
    }
  });

  const handleClickPlayFromHead = useEvent(() => {
    playProgression.current(editorStore.progression);
  });

  const playProgression = useStableLatestRef(
    async (prog: NoteFragmentType[], { bpm }: { bpm?: number } = {}) => {
      setPlaying(false);

      // Clear previous sound
      prevPart.current?.stop();
      // Tone.Transport.cancel();
      Tone.Transport.stop();

      Tone.Transport.bpm.value = tone.bpm;

      // Set BPM from notes
      if (bpm != null) {
        Tone.Transport.bpm.value = bpm;
      } else {
        const bpmNote = prog.find<NoteFragment.BPMChangeNote>(
          (n): n is NoteFragment.BPMChangeNote => n.type === "bpmChange",
        );
        if (bpmNote) {
          Tone.Transport.bpm.value = bpmNote.bpmChange!.bpm;
        }
      }

      // Ticks
      // console.log(tone.enableMetronome);
      const scheduleId = tone.enableMetronome
        ? Tone.Transport.scheduleRepeat(
            (time) => {
              const quarterNote = Tone.Time("4n").toSeconds();
              const eighthNote = Tone.Time("8n").toSeconds();

              // 1拍目の強拍のクリック音をスケジュール
              accentClickSound.start(time);
              accentClickSound.stop(time + eighthNote);

              // 2拍目から4拍目の弱拍のクリック音をスケジュール
              for (let i = 1; i < 4; i++) {
                const nextTime = time + i * quarterNote;
                clickSound.start(nextTime);
                clickSound.stop(nextTime + eighthNote);
              }
            },
            "1m",
            0,
          )
        : null;

      console.log("💿play", prog);

      const lastNoteIndex = prog.findLast(
        (n) => n.noteIndex != null,
      )?.noteIndex;
      const part = (prevPart.current = new Tone.Part(
        (time, frag: NoteFragment.TimedNote) => {
          frag.noteIndex && editorStore.setPlayingNoteIndex(frag.noteIndex);

          if (frag.type === "bpmChange") {
            Tone.Transport.bpm.setValueAtTime(frag.bpmChange.bpm, time);
            return;
          }

          if (frag.type !== "chord") return;

          tone.triggerAttackRelease(
            frag.chord.keys,
            frag.time.duration.beatClockStr,
            time,
          );

          if (frag.noteIndex === lastNoteIndex) {
            editorStore.setPlayingNoteIndex(null);
            setPlaying(false);

            scheduleId && Tone.Transport.clear(scheduleId);
            Tone.Transport.cancel();
            Tone.Transport.stop();
          }
        },
        [],
      ));

      let time = 0;
      prog.forEach((frag) => {
        if (!frag.time) return;

        part.add(Tone.Time(frag.time.startAt.beatClockStr).toSeconds(), frag);
      });

      // Tone.Transport.bpm.value = tone.bpm;
      await Tone.start();
      part.start();
      Tone.Transport.start();

      setPlaying(true);
    },
  );

  const handleChangeValue = useEvent((value: string) => {
    value = value.replace(/* zwsp */ /\u200B/g, "");

    const prog = parseChordProgression(value, "C", SIG_BEATS, 3);

    const note = prog.find(
      (n): n is NoteFragment.ChordNote =>
        n.match.start <= (positionData?.caretPos ?? 0) &&
        (positionData?.caretPos ?? 0) <= n.match.end &&
        n.type === "chord" &&
        n.noteIndex != null,
    );

    editorStore.set({ value, progression: prog });
    setPositionData((prev) => ({
      caretPos: prev?.caretPos ?? 0,
      noteIdx: note?.noteIndex ?? null,
      note: note ?? null,
    }));
  });

  const handleChangeCaretPosition = useEvent((pos: number) => {
    const note = editorStore.progression.find(
      (n): n is NoteFragment.ChordNote =>
        n.match.start <= pos &&
        pos <= n.match.end &&
        n.type === "chord" &&
        n.noteIndex != null,
    );

    // console.log("caret change", pos, note);

    setPositionData({
      caretPos: pos,
      noteIdx: note?.noteIndex ?? null,
      note: note ?? null,
    });

    editorStore.set({
      pointedNoteIndex: note?.noteIndex ?? null,
    });
  });

  useGlobalMousetrap(["command+s", "ctrl+s"], (e) => {
    e.preventDefault();

    if (saveFilePicker.available) handleClickSaveText(null, false);
  });

  useGlobalMousetrap(
    ["alt+[", "command+o"],
    (e) => {
      console.log("prev");
      e.stopPropagation();
      e.preventDefault();
      nodeDetailStore.changeToPrevTab();
    },
    undefined,
    {
      stopCallback: (e) => false,
    },
  );

  useGlobalMousetrap(
    ["alt+]", "command+p"],
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      nodeDetailStore.changeToNextTab();
    },
    undefined,
    {
      stopCallback: (e) => false,
    },
  );

  useEffect(() => {
    editorStore.setProgression(
      parseChordProgression(editorStore.value, "C", SIG_BEATS),
    );
  }, [editorStore.value]);

  const dropState = useDrop({
    onFiles: async ([file]) => {
      if (file.type === "text/plain") {
        const ok = await openModal(CheckContentOverwrite, {});
        if (!ok) return;

        const text = await file.text();

        const prog = parseChordProgression(text, "C", SIG_BEATS);
        editorStore.set({
          value: text,
          progression: prog,
          pointedNoteIndex: 0,
        });
        setPositionData({
          caretPos: 0,
          note: null,
          noteIdx: null,
        });
      }
    },
  });

  const noteDecorator = useMemo(() => {
    return createRichTextEditorDecorator({
      onReplaceNote: handleReplaceNote,
      onInsertAfterNote: handleInsertNoteAfter,
      onRequestRelativelizeAllNotes: handleConvertToDegreeAllNotes,
    });
  }, [handleConvertToDegreeAllNotes, handleReplaceNote, handleInsertNoteAfter]);

  useEffect(() => {
    const value = router.query.s as string;
    if (!router.isReady || !value) return;

    Promise.resolve(
      editorStore.value === "" ? true : openModal(CheckContentOverwrite, {}),
    ).then((ok) => {
      if (!ok) return;

      const decoded = decompressFromEncodedURIComponent(value);
      const prog = parseChordProgression(decoded, "C", SIG_BEATS);
      editorStore.set({
        value: decoded,
        progression: prog,
        pointedNoteIndex: 0,
      });
      setPositionData({
        caretPos: 0,
        note: null,
        noteIdx: null,
      });
    });
  }, [router.isReady]);

  return (
    <main className="flex flex-row h-full flex-1">
      {dropState.over && (
        <div
          className="
          fixed top-0 left-0 z-[100] flex items-center justify-center w-dvw h-dvh
          bg-black bg-opacity-30 text-white font-bold
        "
        >
          {t("editor.dropFile")}
        </div>
      )}

      {/* <ScorePane /> */}

      <div className="flex-1">
        <div className="flex flex-row items-center gap-[8px] p-[16px] bg-indigo-600 text-white border-b-[1px] border-b-[#ddd]">
          <div className="flex items-center gap-[8px]">
            <h1 className="my-auto text-[16px] text-white hidden md:block">
              Harnica
            </h1>
            <Button
              $size="icon"
              $rounded
              className="flex-none w-[32px]"
              onClick={handleClickPlayFromHead}
              disabled={playing}
            >
              <RiSkipForwardFill className="text-gray-600" size={16} />
            </Button>
            <Button
              $size="icon"
              $rounded
              className="flex-none w-[32px]"
              onClick={handleClickPlay}
            >
              <RiPlayFill className="text-gray-600" size={16} />
            </Button>
            <Button
              $size="icon"
              $rounded
              className="flex-none w-[32px]"
              onClick={handleClickPause}
            >
              <RiStopFill className="text-gray-600" size={16} />
            </Button>

            <div className="ml-[4px]" />

            <Button
              $kind="none"
              $size="icon"
              $rounded
              className={twx(
                "bg-white aspect-square bg-opacity-20 hover:bg-opacity-70",
                tone.enableMetronome ? "bg-opacity-40" : "opacity-50",
              )}
              onClick={handleClickToggleMetronome}
            >
              <PiMetronome className="text-white" size={16} />
            </Button>

            <div className="flex flex-none w-[128px] items-center gap-[2px] px-[4px]">
              <Button $kind="none" $size="icon" $rounded>
                {tone.muted ? (
                  <RiVolumeMuteFill
                    className="flex-none text-white cursor-pointer"
                    size={16}
                    onClick={handleClickToggleMute}
                  />
                ) : (
                  <RiVolumeUpFill
                    className="flex-none text-white cursor-pointer"
                    size={16}
                    onClick={handleClickToggleMute}
                  />
                )}
              </Button>
              <Slider
                aria-label="slider-ex-1"
                className="w-full"
                min={-60}
                max={0}
                step={0.01}
                value={[tone.volume]}
                onValueChange={(v) => {
                  tone.volume = v[0];
                }}
              />
            </div>
          </div>
          <div className="ml-auto">
            {t.locale === "ja" ? (
              <Link locale="en" href="/" className="flex items-center">
                <RiGlobalLine className="inline mr-[4px]" /> EN
              </Link>
            ) : (
              <Link locale="ja" href="/" className="flex items-center">
                <RiGlobalLine className="inline mr-[4px]" />
                JA
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[16px] p-[0_16px]">
          <div className="flex flex-col gap-[8px] flex-[2] w-full p-[16px_0px]">
            <div className="flex ">
              <fieldset className="flex gap-[8px] items-center">
                <label>BPM: </label>
                <Input
                  type="number"
                  value={tone.bpm}
                  className="w-[80px]"
                  onChange={(e) => (tone.bpm = e.target.valueAsNumber)}
                />
              </fieldset>

              <Menubar.Root className="ml-[8px]">
                <Menubar.Menu label={t("editor.menu.file.label")}>
                  {saveFilePicker.hasHandle(HANDLER_KEY.TEXT_SAVE) && (
                    <Menubar.Item onClick={handleClickSaveText}>
                      {t("editor.menu.file.save")}
                    </Menubar.Item>
                  )}

                  <Menubar.Item onClick={handleClickSaveTextAs}>
                    {t("editor.menu.file.saveAs")}
                  </Menubar.Item>

                  <Menubar.Separator />

                  {saveFilePicker.hasHandle(HANDLER_KEY.EXPORT_MIDI) && (
                    <Menubar.Item onClick={handleClickSaveMidi}>
                      {t("editor.menu.file.exportMidi")}
                    </Menubar.Item>
                  )}

                  <Menubar.Item onClick={handleClickSaveMidi}>
                    {t("editor.menu.file.exportMidiAs")}
                  </Menubar.Item>

                  {/* <Menubar.SubMenu label={t("editor.menu.file.guides.label")}>

                  </Menubar.SubMenu> */}

                  <Menubar.Separator />

                  <Menubar.SubMenu label={t("editor.menu.file.share.label")}>
                    <Menubar.Item onClick={handleClickShareOnX}>
                      {t("editor.menu.file.share.shareOnX")}
                    </Menubar.Item>
                  </Menubar.SubMenu>
                </Menubar.Menu>

                <Menubar.Menu label={t("editor.menu.edit.label")}>
                  <Menubar.Item onClick={handleConvertToDegreeAllNotes}>
                    {t("editor.menu.edit.convertToDegree")}
                  </Menubar.Item>
                </Menubar.Menu>
              </Menubar.Root>

              <Button
                $kind="primary"
                className="ml-auto"
                onClick={handleClickSaveToLocalStorage}
              >
                <RiSave2Fill className="lg:hidden" />
                <span className="hidden lg:inline-flex">
                  {t("editor.temporarySave")}
                </span>
              </Button>
            </div>
            <div>
              <div
                id="noteEditor"
                className="relative flex flex-col max-h-[40vh] shadow-md rounded-[4px] overflow-hidden"
              >
                <RichTextEditor
                  ref={editorRef}
                  className="h-full p-[8px]"
                  decorate={noteDecorator}
                  onChange={handleChangeValue}
                  onCaretPositionChange={handleChangeCaretPosition}
                  onContextMenu={contextMenu.handleContextEvent}
                  value={editorStore.value}
                />
              </div>
              <Button
                className="relative lg:hidden mt-[8px]"
                onClick={toggleDetailSheetOpened}
              >
                Open Detail
              </Button>
            </div>

            <div className="w-full flex-1 border border-[#ddd] rounded-[4px] overflow-hidden">
              <div className="h-[30vh]">
                <PianoRoll
                  notes={editorStore.progression}
                  onMoveCursorToNote={handleMoveCursorToNote}
                />
              </div>
            </div>
          </div>

          <ActionSheet
            opened={detailSheetOpened}
            enabled={isNarrowScreen}
            backdrop={false}
            onClose={toggleDetailSheetOpened}
            className="max-h-[50dvh] overflow-auto"
          >
            <div
              className="flex-[1] p-[8px] lg:border-l-[1px] border-l-[#ddd] overflow-y-auto"
              onMouseLeave={handlenMoseLeaveOnTip}
            >
              <Tabs.Root defaultPage="suggest">
                <Tabs.TabBar className="sticky top-0">
                  <Tabs.Tab name="suggest">{t("noteDetail.suggest")}</Tabs.Tab>
                  <Tabs.Tab name="notation">
                    {t("noteDetail.aboutSyntax")}
                  </Tabs.Tab>
                </Tabs.TabBar>

                <Tabs.TabPage name="suggest" className="p-[8px]">
                  {positionData?.note?.type === "chord" ? (
                    <NoteDetail
                      matchNote={positionData.note}
                      onReplaceNote={handleReplaceNote}
                      onInsertAfterNote={handleInsertNoteAfter}
                      onMoveCursorToNote={handleMoveCursorToNote}
                    />
                  ) : (
                    <div className="p-[16px] cursor-default bg-neutral-50 rounded-[8px] shadow-md text-[14px]">
                      {t("editor.noticeSelectNote")}
                    </div>
                  )}
                </Tabs.TabPage>

                <Tabs.TabPage name="notation" className="p-[8px]">
                  <Markdown className="p-[16px] cursor-default bg-neutral-50 rounded-[8px] shadow-md">
                    {t.locale === "ja" ? (
                      <AboutNotationJa />
                    ) : (
                      <AboutNotationEn />
                    )}
                  </Markdown>
                </Tabs.TabPage>
              </Tabs.Root>
              <div className="text-right p-[8px]">
                <a
                  href="https://github.com/hanakla/harnica"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline text-[12px]"
                >
                  GitHub
                </a>
              </div>
            </div>
          </ActionSheet>
        </div>
      </div>

      <Portal>
        <ContextMenu id={contextMenuId}>
          <MenuItem onClick={handleConvertToDegreeAllNotes}>
            {t("editor.menu.edit.convertToDegree")}
          </MenuItem>
        </ContextMenu>
      </Portal>
    </main>
  );
}

const createRichTextEditorDecorator = ({
  onReplaceNote,
  onInsertAfterNote,
  onRequestRelativelizeAllNotes,
}: {
  onReplaceNote: OnReplaceNoteHandler;
  onInsertAfterNote: OnInsertNoteAfterHandler;
  onRequestRelativelizeAllNotes: () => void;
}): RichTextEditor.Decorator => {
  return (text) => {
    const fragments = parseChordProgression(text, "C", SIG_BEATS);

    return fragments.map((frag) => {
      if (frag.type === "comment") {
        return (
          <span key={frag.fragIndex} className="text-gray-400 mb-[32px]">
            {frag.match.string}
          </span>
        );
      }

      if (frag.type === "characters") {
        return (
          <span
            key={frag.fragIndex}
            className="mb-[32px]"
            data-type="characters"
          >
            {frag.match.string}
          </span>
        );
      }

      if (frag.type !== "chord") {
        return (
          <span
            key={frag.fragIndex}
            className="mr-[8px] mb-[32px]"
            style={{
              color:
                frag.type === "braceBegin" || frag.type === "braceEnd"
                  ? "#e19a27"
                  : frag.type === "bpmChange"
                    ? "#eaa211"
                    : "#7fa537",
            }}
          >
            {frag.match.string}
          </span>
        );
      }

      return (
        <LeafRichText
          key={frag.fragIndex}
          fragment={frag}
          className="mb-[32px]"
          onReplaceNote={onReplaceNote}
          onInsertAfterNote={onInsertAfterNote}
          onRequestRelativelizeAllNotes={onRequestRelativelizeAllNotes}
        />
      );
    });
  };
};
