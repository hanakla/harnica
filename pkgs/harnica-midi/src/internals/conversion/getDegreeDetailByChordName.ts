import { parseStringAsSingleChordNote } from "../parser/chord-parser-2";
import { DEGREE_TO_KEYVALUE_MAP, KEYVALUE_TO_DEGREE_MAP } from "../constants";
import { stringifyNoteQualities } from "../assemble/stringifyNoteQualities";
import { NoteFragment } from "../parser/types";
import { getKeyValueByKeyName } from "../key-calculation/getKeyValueBy";
import { normalizeKeyValue } from "../key-calculation/normalizeKeyValue";

/**
 * Obtain Degree from Alphabet notation
 */
export function getDegreeDetailByChordName(
  value: string | NoteFragment.ChordNote["chord"],
  key: number | string,
) {
  const chord =
    typeof value === "string"
      ? parseStringAsSingleChordNote(value)!.chord
      : value;
  if (!chord) return null;

  const qualities = chord.detail.qualities;
  const rootKeyValue = getKeyValueByKeyName(chord.detail.rootName)!;
  const keyValue = typeof key === "string" ? getKeyValueByKeyName(key)! : key;
  const normalized = normalizeKeyValue(rootKeyValue - keyValue);
  const degreeNumeral = KEYVALUE_TO_DEGREE_MAP[normalized];

  return {
    rootName: degreeNumeral,
    chordName: `${degreeNumeral}${stringifyNoteQualities(qualities)}`,
    qualities: qualities,
    qualitiesString: stringifyNoteQualities(qualities),
  };
}
