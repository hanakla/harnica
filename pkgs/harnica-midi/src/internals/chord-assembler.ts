// Processing for chord and note stringification

import { DEGREE_TO_KEYVALUE_MAP } from "./constants";
import { getKeyNameByKeyValue } from "./assemble/getKeyNameByKeyValue";
import { NoteFragment, NoteQuality } from "./parser/types";
import { stringifyNoteQualities } from "./assemble/stringifyNoteQualities";
import { normalizeKeyValue } from "./key-calculation/normalizeKeyValue";

export function formatNote(
  note: {
    octave?: number;
    rootName: NoteFragment.ChordNote["chord"]["detail"]["rootName"];
    rootDegreeName: NoteFragment.ChordNote["chord"]["detail"]["rootDegreeName"];
    qualities: NoteQuality[];
  } | null,
  opts: { degree?: boolean } = {},
): string {
  if (note == null) return "";

  const { octave, rootName, rootDegreeName, qualities } = note;

  const keyString = opts.degree ? rootDegreeName : rootName;
  const qualityString = stringifyNoteQualities(qualities);

  return (
    (octave === 1 ? "+" : octave === -1 ? "-" : "") + keyString + qualityString
  );
}

export function getKeyNamesByKeyValues(
  keyValues: number[],
  baseOctave?: number,
) {
  return keyValues.map((keyValue) =>
    getKeyNameByKeyValue(keyValue, baseOctave),
  );
}

/** @deprecated */
export function getDegreeStringFromKeyValue(
  value: number,
  baseOctave?: number,
) {
  const normalized = normalizeKeyValue(value);
  const keyName = Object.keys(DEGREE_TO_KEYVALUE_MAP).find(
    (key) => DEGREE_TO_KEYVALUE_MAP[key] === normalized,
  );

  if (!keyName) throw new Error(`Invalid key value: ${value}`);

  if (baseOctave == null) return keyName;

  const octave = baseOctave + Math.floor(value / 12);
  return keyName + octave.toString();
}
