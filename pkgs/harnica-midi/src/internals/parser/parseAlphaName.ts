import { ALPHA_TO_KEYVALUE_MAP, DEFAULT_OCTAVE } from "@/internals/constants";
import { getKeyValueByKeyName } from "@/internals/key-calculation/getKeyValueBy";
import { chordIRToNoteChord } from "./chordIRToNoteChord";
import { parseQuality } from "./parseQuality";
import { ChordIR, NoteFragment } from "./types";
import { normalizeKeyValue } from "@/internals/key-calculation/normalizeKeyValue";
import { lintNote, lintQuality } from "./lintNote";
import { parseApplyKeyString } from "./parseKeyChange";
import { KeyString } from "../types";

export const ALPHA_NOTE_REGEX =
  /^([+-]?)([A-G](?:[#b\-+](?!5))?)([^/|\nA-G ]*)(?:\/([+-]?[A-G][#b]?))?/;

export function parseAlphabetName(
  chord: string,
  applyingKey: KeyString,
  baseOctave: number = DEFAULT_OCTAVE,
): NoteFragment.ChordNote["chord"] | null {
  const match = ALPHA_NOTE_REGEX.exec(chord);

  if (!match) {
    throw new Error(`Invalid chord string: ${chord}`);
  }

  const chordIR = createChordIRByAlpha(chord, applyingKey);
  if (!chordIR) return null;

  return chordIRToNoteChord(chordIR, false, baseOctave);
}

export function isValidAlphabetName(note: string): boolean {
  return ALPHA_NOTE_REGEX.test(note);
}

function createChordIRByAlpha(
  chord: string,
  applyingKeyName: KeyString,
): ChordIR | null {
  const applyKey = parseApplyKeyString(applyingKeyName);
  const match = ALPHA_NOTE_REGEX.exec(chord);

  if (!match || !applyKey) return null;

  const keyKeyValue = getKeyValueByKeyName(applyKey.key)!;
  const octaveSign = match[1];
  const root = match[2];
  const qualities = parseQuality(match[3]);
  const slash = match[4];
  const omit = match[5];

  const slashKeyValue = parseAlphaSlashKey(slash);
  if (slash != null && slashKeyValue == null) return null;

  const ir: ChordIR = {
    root: getKeyValueByKeyName(root)! - keyKeyValue,
    qualities,
    slash: slashKeyValue != null ? slashKeyValue - keyKeyValue : null,
    omitted: omit
      ? [normalizeKeyValue(parseInt(omit, 10) - keyKeyValue)]
      : undefined,
    octave: { "-": -1, "": 0, "+": 1 }[octaveSign]! as -1 | 0 | 1,
    applyKey,
    originalInput: match[0],
    warns: [],
  };

  ir.warns = [
    ...lintNote(ir, { rootKeyName: root, isDegree: false }),
    ...lintQuality(qualities, match[3]),
  ];

  return ir;
}

function parseAlphaSlashKey(key: string | null): number | null {
  if (!key) return null;

  const match = /^([+-])?([A-G][#b]?)/.exec(key);
  if (!match) return null;

  const sign = match[1] ?? "";
  const keyName = match[2];

  return (
    ALPHA_TO_KEYVALUE_MAP[keyName] + ({ "+": 12, "-": -12, "": 0 }[sign] ?? 0)
  );
}
