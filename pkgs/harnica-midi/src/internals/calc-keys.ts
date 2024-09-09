import {
  DEFAULT_OCTAVE,
  TENSION_NOTE_MAP,
  TENSION_NOTE_MAP_KEYS,
  ALPHA_TO_KEYVALUE_MAP,
} from "./constants";
import { createNoteNote } from "./note";
import { NoteFragment, type NoteQuality } from "./parser/types";
import { getKeyValueByKeyName } from "./key-calculation/getKeyValueBy";

export function resolveNote(
  note: NoteFragment.ChordNote,
  key: string,
  baseOctave: number = DEFAULT_OCTAVE,
): NoteFragment.ChordNote {
  if (note.chord.isDegree === false) return note;

  const resolvedValues = resolveDegreeKeyValue(note.chord.keyValues, key);
  return createNoteNote(resolvedValues, false, key);
}

export function resolveDegreeKeyValue(keys: number[], key: string = "C") {
  const keyValue = getKeyValueByKeyName(key);
  return keys.map((key) => key + keyValue);
}

export function resolvedToDegreeNote(
  note: NoteFragment.ChordNote,
  key: string,
) {
  if (note.chord.isDegree == true) return note;

  const keyValue = getKeyValueByKeyName(key);
  const diffKeys = note.chord.keyValues.map((key) => key - keyValue);

  return createNoteNote(diffKeys, true, key);
}

/** Get key value by single key name
 * @deprecated
 */
export function getKeyValueByKeyString(key: string) {
  const match = /^([+-]?)([A-G][#b-]?)([Mm]?)$/.exec(key);
  if (!match) throw new Error(`Invalid key string: ${key}`);

  const [, accidental, note] = match;

  return (
    ALPHA_TO_KEYVALUE_MAP[note] +
    (accidental === "-" ? -12 : accidental === "+" ? 12 : 0)
  );
}
