import { useCombineRef } from "@hanakla/arma";
import {
  type NoteFragmentType,
  normalizeKeyValue,
  getDegreeNameFromKeyValue,
} from "@hanakla/harnica-lib";
import React, { useState, useMemo, ReactNode, useEffect } from "react";
import { useEffectOnce, useMeasure } from "react-use";
import useEvent from "react-use-event-hook";
import { clamp } from "@/utils/clamp";
import { twx } from "@/utils/tw";
import { useTone } from "../hooks/tone";
import { useEditorStore } from "../hooks/useEditorStore";
import { OnMoveCursorToNote } from "./ScoreEditor/types";

const PIANO_KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const BEAT_WIDTH = 50;
const NOTE_HEIGHT = 14;
const TOTAL_OCTAVES = 7;
const TOTAL_NOTES = TOTAL_OCTAVES * 12;
const MAX_SCROLL_X = 1000 * BEAT_WIDTH; // assuming a max of 1000 beats
const MAX_SCROLL_Y = NOTE_HEIGHT * TOTAL_NOTES;

function beatClockToBeats(transport: number[], beatPerBars: number = 4) {
  const [bars, beats, __] = transport;
  return bars * beatPerBars + beats;
}

function roundToNearXn(value: number, x: number) {
  return Math.round(value / x) * x;
}

const PianoRoll: React.FC = ({ notes, onMoveCursorToNote }) => {
  const editorStore = useEditorStore();
  const sampler = useTone();

  const pointedNoteIndex = editorStore.pointedNoteIndex;

  const [measureRef, { width, height }] = useMeasure<HTMLDivElement>();
  const rootRef = useCombineRef<HTMLDivElement>(measureRef);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0); // added this for vertical scroll

  const handleClickNoteKey = useEvent((e: React.MouseEvent) => {
    const key = e.currentTarget.dataset.key;
    if (!key) return;

    sampler.triggerAttackRelease([key], "4n");
  });

  const handleDragStart = useEvent(() => {
    setIsDragging(true);
  });

  const handleDragEnd = useEvent(() => {
    setIsDragging(false);
  });

  const handleDrag = useEvent((event: React.MouseEvent) => {
    if (!isDragging) return;
    const newScrollX = clamp(scrollX - event.movementX, 0, MAX_SCROLL_X);
    const newScrollY = clamp(
      scrollY + event.movementY,
      0,
      MAX_SCROLL_Y - height,
    );
    setScrollX(newScrollX);
    setScrollY(newScrollY);
  });

  const handleWheel = useEvent((event: WheelEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setScrollX((prev) => clamp(prev + event.deltaX, 0, MAX_SCROLL_X));
    setScrollY((prev) => clamp(prev - event.deltaY, 0, MAX_SCROLL_Y - height));
  });

  const handleClickNote = useEvent((event: React.MouseEvent) => {
    const noteIndex = Number(event.currentTarget.dataset.noteIndex);
    onMoveCursorToNote(noteIndex);
  });

  const [renderedNotes, noteXPositions, noteYPositions] = useMemo(() => {
    const startKey = 0;
    const endKey = 1000;

    const noteComponents: ReactNode[] = [];
    const noteXPositions: Record<number, number> = {};
    const noteYPositions: Record<number, number> = {};

    notes.map((note) => {
      if (note.type !== "chord") return null;

      const beats = beatClockToBeats(note.time.duration.beatClock, 4);
      const x = beatClockToBeats(note.time.startAt.beatClock, 4) * BEAT_WIDTH;

      noteXPositions[note.noteIndex] = x;

      const keyValues = [
        ...new Set([
          ...note.chord.keyValues.map(
            (v, i) => ["normal", v, note.chord.keys[i], i] as const,
          ),
          ...note.chord.keyValues.map(
            (v, i) => ["ghost", v + 12, note.chord.keys[i], null] as const,
          ),
          ...note.chord.keyValues.map(
            (v, i) => ["ghost", v - 12, note.chord.keys[i], null] as const,
          ),
        ]),
      ];

      keyValues.forEach(([type, keyValue, key, originalIdx], idx) => {
        const reverseY = keyValue * NOTE_HEIGHT;
        const y =
          roundToNearXn(height - reverseY + scrollY, NOTE_HEIGHT) - NOTE_HEIGHT;
        originalIdx === 0 && (noteYPositions[note.noteIndex] = y);

        if (keyValue >= startKey && keyValue < endKey) {
          noteComponents.push(
            <g
              key={`${note.noteIndex}-${idx}`}
              className={twx(type === "ghost" && "opacity-50")}
              data-note-index={note.noteIndex}
              onClick={handleClickNoteKey}
            >
              <rect
                x={x}
                y={y}
                width={beats * BEAT_WIDTH}
                height={NOTE_HEIGHT}
                fill={type === "normal" ? "currentColor" : "#eed4ff"}
                rx={2}
                onMouseDown={type === "normal" ? handleClickNoteKey : undefined}
                pointerEvents={type === "normal" ? "all" : "none"}
                data-key={key}
              />
              <text
                x={x + 2}
                y={y + 1}
                fill="white"
                fontSize={14}
                fontWeight="bold"
                dominantBaseline="hanging"
                pointerEvents="none"
                className={twx(type === "ghost" && "opacity-0")}
              >
                {key}
                {note.chord.isDegree
                  ? `(${getDegreeNameFromKeyValue(keyValue, undefined, { key: note.chord.appliedKey })})`
                  : ""}
              </text>
            </g>,
          );
        }
      });
    });

    return [noteComponents, noteXPositions, noteYPositions] as const;
  }, [notes, scrollY, height, handleClickNoteKey]);

  const renderPianoKeys = useMemo(() => {
    const startKey = Math.floor(scrollY / NOTE_HEIGHT);
    const endKey = Math.min(
      startKey + Math.ceil(height / NOTE_HEIGHT),
      TOTAL_NOTES,
    );
    const keys = [];

    for (let i = startKey; i < endKey; i++) {
      const octave = Math.floor(i / 12);
      const keyIndex = normalizeKeyValue(i);
      const key = PIANO_KEYS[keyIndex];
      const y = roundToNearXn(
        (endKey - i) * NOTE_HEIGHT - NOTE_HEIGHT,
        NOTE_HEIGHT,
      );

      if (key.includes("#")) {
        keys.push(
          <g key={`${key}${octave}`}>
            <rect
              key={`${key}${octave}`}
              x={0}
              y={y}
              width={BEAT_WIDTH / 2}
              height={NOTE_HEIGHT}
              fill="black"
              rx="2"
            />
            <line
              x1={0}
              y1={y}
              x2={BEAT_WIDTH}
              y2={y}
              stroke="#aaa"
              strokeWidth="1"
            />
          </g>,
        );
      } else {
        keys.push(
          <g key={`${key}${octave}`}>
            <rect
              x={0}
              y={y}
              width={BEAT_WIDTH}
              height={NOTE_HEIGHT}
              fill="white"
            />
            <line
              x1={0}
              y1={y}
              x2={BEAT_WIDTH}
              y2={y}
              stroke="#aaa"
              strokeWidth=".5"
            />
            {key === "C" && (
              <text
                x={BEAT_WIDTH - 4}
                y={y + NOTE_HEIGHT - 3}
                fontSize={12}
                textAnchor="end"
              >
                C{octave}
              </text>
            )}
          </g>,
        );
      }
    }

    keys.push(
      <line
        key={`keys-sep`}
        x1={BEAT_WIDTH}
        y1={0}
        x2={BEAT_WIDTH}
        y2={height}
        stroke="black"
        strokeWidth="1"
        strokeOpacity="0.5"
      />,
    );

    return keys;
  }, [scrollY, height]);

  const renderGrid = useMemo(() => {
    const grid = [];
    const startBar = Math.floor(scrollX / BEAT_WIDTH);
    const endBar = startBar + Math.ceil(width / BEAT_WIDTH);

    for (let bar = startBar; bar < endBar; bar++) {
      const x = bar * BEAT_WIDTH;

      grid.push(
        <line
          key={`bar-${bar}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#999"
          strokeWidth="1"
          {...(bar % 4 === 0
            ? {}
            : {
                strokeOpacity: "0.5",
              })}
        />,
      );
    }
    return grid;
  }, [scrollX, width, height]);

  const renderBackground = useMemo(() => {
    const startKey = Math.floor(scrollY / NOTE_HEIGHT);
    const endKey = Math.min(
      startKey + Math.ceil(height / NOTE_HEIGHT),
      TOTAL_NOTES,
    );
    const background = [];
    const lines = [];

    for (let i = startKey; i < endKey; i++) {
      const octave = Math.floor(i / 12);
      const keyIndex = normalizeKeyValue(i);
      const key = PIANO_KEYS[keyIndex];
      const y = (endKey - i) * NOTE_HEIGHT - NOTE_HEIGHT;

      if (key.includes("#")) {
        background.push(
          <rect
            key={`background-black-${key}${octave}`}
            x={0}
            y={y}
            width="100%"
            height={NOTE_HEIGHT}
            fill="#eee"
          />,
        );
      } else {
        background.push(
          <rect
            key={`background-white-${key}${octave}`}
            x={0}
            y={y}
            width="100%"
            height={NOTE_HEIGHT}
            fill="white"
          />,
        );
        lines.push(
          <line
            key={`line-${key}${octave}`}
            x1={0}
            y1={y}
            x2="100%"
            y2={y}
            stroke={key === "B" ? "#000" : "#aaa"}
            strokeWidth=".5"
          />,
        );
      }
    }

    return [...background, ...lines];
  }, [scrollY, height]);

  useEffect(() => {
    if (pointedNoteIndex == null) return;

    setScrollX(noteXPositions[pointedNoteIndex] - width / 2);

    // setScrollY(height - noteYPositions[activeNoteIdx]);
    setScrollY(NOTE_HEIGHT * (12 * 3 + 6));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointedNoteIndex]);

  useEffectOnce(() => {
    rootRef.current?.addEventListener("wheel", handleWheel);
    return () => {
      rootRef.current?.removeEventListener("wheel", handleWheel);
    };
  });

  return (
    <div
      ref={rootRef}
      style={{ height: `100%` }}
      className={twx(
        "relative overflow-hidden select-none max-h-full",
        "pianorole-root",
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :where(.pianorole-root) [data-note-index="${editorStore.pointedNoteIndex}"] {
            color: #a3d847;
          }

          :where(.pianorole-root) [data-note-index="${editorStore.playingNoteIndex}"] {
            color: #47a2d8;
          }
      `,
        }}
      />
      <svg
        style={{
          position: "absolute",
          width: `${BEAT_WIDTH}px`,
          height: `${height}px`,
          overflow: "visible",
        }}
      >
        {renderPianoKeys}
      </svg>
      <svg
        style={{
          position: "absolute",
          left: `${BEAT_WIDTH}px`,
          width: `calc(100% - ${BEAT_WIDTH}px)`,
          height: `${height}px`,
          overflow: "scroll",
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <g transform={`translate(${-scrollX}, 0)`}>
          <g transform={`translate(${scrollX}, 0)`}>{renderBackground}</g>
          {renderGrid}
          <g data-region="notes">{renderedNotes}</g>
        </g>
      </svg>
    </div>
  );
};

export default PianoRoll;
