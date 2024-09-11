import { getAlphabetNameFromKeyValue } from "@/internals/conversion/getAlphabetNameFromKeyValue";
import { getChordDetailFromKeyValues } from "@/internals/conversion/getChordDetailFromKeyValues";
import { ChordSuggest } from "./toDegreeSuggest";
import { parseStringAsSingleChordNote } from "@/internals/parser/chord-parser-2";
import { KeyString } from "@/internals/types";

export function getTensionedChords(
  chord: string,
  tension: number,
): {
  ninth: ChordSuggest;
  eleventh: ChordSuggest;
  thirteenth: ChordSuggest;
} | null {
  const notes = parseStringAsSingleChordNote(chord, "C" as KeyString);
  if (!notes) return null;

  const keyValues = notes.chord.keyValues.map((value) => value + tension);

  // const _ninthFlat = [...new Set([...keyValues, 13])].sort();
  const _ninth = [...new Set([...keyValues, 14])].sort();
  // const _ninthSharp = [...new Set([...keyValues, 15])].sort();

  // const _eleventhFlat = [...new Set([...keyValues, 16])].sort();
  const _eleventh = [...new Set([...keyValues, 17])].sort();
  // const _eleventhSharp = [...new Set([...keyValues, 18])].sort();

  // const _thirteenthFlat = [...new Set([...keyValues, 19])].sort();
  const _thirteenth = [...new Set([...keyValues, 21])].sort();
  // const _thirteenthSharp = [...new Set([...keyValues, 23])].sort();

  return {
    ninth: {
      root: getAlphabetNameFromKeyValue(_ninth[0]),
      chordName: getChordDetailFromKeyValues(_ninth).chordName,
      resolvedChordName: getChordDetailFromKeyValues(_ninth).chordName,
      keys: _ninth.map((value) => getAlphabetNameFromKeyValue(value)),
      keyValues: _ninth,
      relativeOctave: _ninth[0] > 12 ? 1 : 0,
    },
    eleventh: {
      root: getAlphabetNameFromKeyValue(_eleventh[0]),
      chordName: getChordDetailFromKeyValues(_eleventh).chordName,
      resolvedChordName: getChordDetailFromKeyValues(_eleventh).chordName,
      keys: _eleventh.map((value) => getAlphabetNameFromKeyValue(value)),
      keyValues: _eleventh,
      relativeOctave: _eleventh[0] > 12 ? 1 : 0,
    },
    thirteenth: {
      root: getAlphabetNameFromKeyValue(_thirteenth[0]),
      chordName: getChordDetailFromKeyValues(_thirteenth).chordName,
      resolvedChordName: getChordDetailFromKeyValues(_thirteenth).chordName,
      keys: _thirteenth.map((value) => getAlphabetNameFromKeyValue(value)),
      keyValues: _thirteenth,
      relativeOctave: _thirteenth[0] > 12 ? 1 : 0,
    },
  };
}
