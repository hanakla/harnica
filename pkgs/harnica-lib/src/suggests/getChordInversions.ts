import { getInversionChordKeyValues } from "@/internals/key-calculation/getInversionChordKeyValues";
import { parseStringAsSingleChordNote } from "../internals/parser/chord-parser-2";
import { DEFAULT_KEY } from "../internals/constants";
import { getKeyNamesByKeyValues } from "../internals/chord-assembler";
import { stringifyNoteQualities } from "@/internals/assemble/stringifyNoteQualities";
import { getKeyNameByKeyValue } from "@/internals/assemble/getKeyNameByKeyValue";
import { ChordSuggest } from "@/suggests/toDegreeSuggest";
import { getChordDetailFromKeyValues } from "..";

/**
 * @param chord Single chord string (e.g. "Cm7", "C")
 * @param inversion Inversion number (e.g. 1, 2, -1, -2)
 */
export function getChordInversions(
  chord: string,
  inversion: number,
  baseOctave: number = 0,
  { degree = false }: { degree?: boolean } = {},
): ChordSuggest {
  const note = parseStringAsSingleChordNote(chord, DEFAULT_KEY, baseOctave);
  if (!note) {
    throw new Error(`Invalid chord notes for chord inversion: ${chord}`);
  }

  const inversions = getInversionChordKeyValues(
    note.chord.keyValues,
    inversion,
  );

  // 転回形のコード名を生成する
  // const rootNoteName = getKeyNameByKeyValue(note.chord.keyValues[0]);
  // const chordType = stringifyNoteQualities(note.chord.detail.qualities);
  // const bassNoteName = getKeyNameByKeyValue(inversions[0]);
  // const inversionName = `${rootNoteName}${chordType}${"/" + bassNoteName}`;
  const result = getChordDetailFromKeyValues(inversions, baseOctave, {
    degree,
  });

  return {
    root: getKeyNameByKeyValue(result.keysValues[0]),
    chordName: degree ? result.degreeName : result.chordName,
    resolvedChordName: result.chordName,
    keys: getKeyNamesByKeyValues(inversions),
    keyValues: inversions,
    relativeOctave: inversions[0] > 12 ? 1 : 0,
  };
}
