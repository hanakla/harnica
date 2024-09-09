import { NoteFragment } from "../internals/parser/types";

import { convertChordNoteToChordIR } from "@/internals/conversion/convertChordNoteToChordIR";
import { getKeyValueByKeyName } from "@/internals/key-calculation/getKeyValueBy";
import { normalizeKeyValue } from "@/internals/key-calculation/normalizeKeyValue";
import { Maybe, maybe } from "@/utils/Maybe";

type RelationResult = {
  isStrongProgression: boolean;
  isDominantMotion: boolean;
};

export function getRelationBetweenNotes(
  fromNote: NoteFragment.ChordNote,
  toNote: NoteFragment.ChordNote,
): Maybe<RelationResult> {
  const fromIR = convertChordNoteToChordIR(fromNote);
  const toIR = convertChordNoteToChordIR(toNote);

  if (!fromIR || !toIR) return maybe.fail(new Error("Invalid note"));

  const hasTriTone = hasTriToneKeys;
  const fromKeyKeyValue = getKeyValueByKeyName(
    fromNote.chord.appliedKey ?? "C",
  );
  const toKeyKeyValue = getKeyValueByKeyName(toNote.chord.appliedKey ?? "C");

  return maybe.ok({
    isStrongProgression:
      normalizeKeyValue(fromIR.root + fromKeyKeyValue) ===
      normalizeKeyValue(toIR.root + toKeyKeyValue + 7),
    // Domnant motion / 全終止
    isDominantMotion:
      hasTriTone(fromNote) &&
      normalizeKeyValue(fromIR.root + fromKeyKeyValue) ===
        normalizeKeyValue(toIR.root + toKeyKeyValue + 7),
  });
}

const hasTriToneKeys = (note: NoteFragment.ChordNote) => {
  const values = note.chord.keyValues;
  const eachInterval = values.map((v) => values.map((v2) => v2 - v)).flat();
  return eachInterval.includes(6);
};
