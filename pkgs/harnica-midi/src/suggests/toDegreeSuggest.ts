import { getKeyNamesByKeyValues } from "../internals/chord-assembler";
import { getChordDetailFromKeyValues } from "@/internals/conversion/getChordDetailFromKeyValues";
import { getDegreeDetailByChordName } from "@/internals/conversion/getDegreeDetailByChordName";
import { getKeyValueByKeyName } from "@/internals/key-calculation/getKeyValueBy";
import { getDegreeNameFromKeyValue } from "@/internals/conversion/getDegreeNameFromKeyValue";

export type ChordSuggest = {
  root: string;
  chordName: string;
  resolvedChordName: string;
  keys: string[];
  keyValues: number[];
  relativeOctave: number;
};

export function toDegreeSuggest(
  suggest: ChordSuggest,
  key: string | number,
): ChordSuggest {
  const chord = getChordDetailFromKeyValues(suggest.keyValues);
  return {
    root: getDegreeNameFromKeyValue(getKeyValueByKeyName(suggest.root)),
    chordName: getDegreeDetailByChordName(chord.chordName, key)!.chordName,
    resolvedChordName: chord.chordName,
    keys: getKeyNamesByKeyValues(suggest.keyValues),
    keyValues: suggest.keyValues,
    relativeOctave: suggest.keyValues[0] > 12 ? 1 : 0,
  };
}
