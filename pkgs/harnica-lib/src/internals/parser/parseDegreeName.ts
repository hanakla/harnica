import { DEFAULT_KEY, DEGREE_TO_KEYVALUE_MAP } from "../constants";
import { KeyString } from "../types";
import { chordIRToNoteChord } from "./chordIRToNoteChord";
import { lintNote, lintQuality } from "./lintNote";
import { parseApplyKeyString } from "./parseKeyChange";
import { parseQuality } from "./parseQuality";
import { ChordIR, NoteFragment } from "./types";

export const DEGREE_NOTE_REGEX =
  /^([+-]?)([IV]+(?:[#b\-](?!5))?)([^/|\nIV ]*)(?:\/([+-]?[IV]+[#b]?))?/;

export function parseDegreeName(
  note: string,
  applyingKey: string,
  baseOctave: number,
): NoteFragment.ChordNote["chord"] | null {
  const matchResult = createChordIRByDegree(note, applyingKey);
  if (!matchResult) return null;

  return chordIRToNoteChord(matchResult, true, baseOctave);
}

export function isValidDegreeName(note: string): boolean {
  return DEGREE_NOTE_REGEX.test(note);
}

function createChordIRByDegree(
  chord: string,
  applyingKeyName: string = DEFAULT_KEY,
): ChordIR | null {
  const applyKey = parseApplyKeyString(applyingKeyName);
  const match = DEGREE_NOTE_REGEX.exec(chord);

  if (!match || !applyKey) return null;

  const octaveSign = match[1];
  const degreeRoot = match[2];
  const qualities = parseQuality(match[3]);
  const slash = match[4];
  const omit = match[5];

  const rootKeyValue = DEGREE_TO_KEYVALUE_MAP[degreeRoot];
  const slashKeyValue = parseDegreeSlashKey(slash);

  if (rootKeyValue == null) return null;
  if (slash != null && slashKeyValue == null) return null;

  const ir: ChordIR = {
    root: rootKeyValue,
    qualities,
    slash: slashKeyValue,
    omitted: omit ? [parseInt(omit, 10)] : undefined,
    octave: ({ "-": -1, "": 0, "+": 1 }[octaveSign]! as -1 | 0 | 1) ?? 0,
    applyKey: applyKey ?? null,
    originalInput: match[0],
    warns: [],
  };

  ir.warns = [
    ...lintNote(ir, { rootKeyName: degreeRoot, isDegree: false }),
    ...lintQuality(qualities, match[3]),
  ];

  return ir;
}

function parseDegreeSlashKey(key: string | null): number | null {
  if (!key) return null;

  const match = /^([+-])?([IV]+[#b]?)/.exec(key);
  if (!match) return null;

  const sign = match[1] ?? "";
  const degreeKey = match[2];

  return (
    DEGREE_TO_KEYVALUE_MAP[degreeKey] +
    ({ "+": 12, "-": -12, "": 0 }[sign] ?? 0)
  );
}
