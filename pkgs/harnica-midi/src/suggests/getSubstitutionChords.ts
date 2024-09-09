import { parseStringAsSingleChordNote } from "../internals/parser/chord-parser-2";
import { DEFAULT_KEY } from "../internals/constants";
import { getKeyNamesByKeyValues } from "../internals/chord-assembler";
import { getChordDetailFromKeyValues } from "@/internals/conversion/getChordDetailFromKeyValues";
import { ChordSuggest, toDegreeSuggest } from "@/suggests/toDegreeSuggest";

/**
 * Obtain substitution chords for a given chord.
 */
export function getSubstitutionChords(
  chord: string,
  type: keyof typeof scaleIntervals,
  key: string = DEFAULT_KEY,
  opt: { degree?: boolean } = {},
): { vi: ChordSuggest; iii: ChordSuggest } {
  const keyValues = parseStringAsSingleChordNote(chord, key)!.chord.keyValues;

  const root = keyValues[0];
  const intervals = scaleIntervals[type];

  // Create a two-octave scale
  const scale: number[] = [root];
  for (let i = 0; i < intervals.length * 2; i++) {
    const lastNote = scale[scale.length - 1];
    const nextNote = lastNote + intervals[i % intervals.length];
    scale.push(nextNote);
  }

  // Get the notes for the vi and iii chords
  const viChord = getChordDetailFromKeyValues([scale[5], scale[7], scale[9]]);
  const iiiChord = getChordDetailFromKeyValues([scale[2], scale[4], scale[6]]);

  const viChordSuggest: ChordSuggest = {
    root: viChord.rootKeyName,
    chordName: viChord.chordName,
    resolvedChordName: viChord.chordName,
    keys: getKeyNamesByKeyValues(viChord.keysValues),
    keyValues: viChord.keysValues,
    relativeOctave: viChord.keysValues[0] > 12 ? 1 : 0,
  };

  const iiiChordSuggest: ChordSuggest = {
    root: iiiChord.rootKeyName,
    chordName: iiiChord.chordName,
    resolvedChordName: iiiChord.chordName,
    keys: getKeyNamesByKeyValues(iiiChord.keysValues),
    keyValues: iiiChord.keysValues,
    relativeOctave: iiiChord.keysValues[0] > 12 ? 1 : 0,
  };

  return {
    vi: opt.degree
      ? toDegreeSuggest(viChordSuggest, DEFAULT_KEY)
      : viChordSuggest,
    iii: opt.degree
      ? toDegreeSuggest(iiiChordSuggest, DEFAULT_KEY)
      : iiiChordSuggest,
  };
}

const scaleIntervals = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  harmonicMinor: [2, 1, 2, 2, 1, 3],
  melodicMinor: [2, 1, 2, 2, 2, 2],
  harmonicMajor: [2, 2, 1, 2, 1, 3],
  pentatonic: [2, 2, 3, 2],
  blues: [3, 2, 1, 1, 3],
  dorian: [2, 1, 2, 2, 2, 1, 2], // Dorian mode
  phrygian: [1, 2, 2, 2, 1, 2, 2], // Phrygian mode
  lydian: [2, 2, 2, 1, 2, 2, 1], // Lydian mode
  mixolydian: [2, 2, 1, 2, 2, 1, 2], // Mixolydian mode
  locrian: [1, 2, 2, 1, 2, 2, 2], // Locrian mode
  arabian: [1, 2, 1, 2, 1, 2, 2],
  hirajoshi: [2, 1, 4, 1, 4], // Hirajoshi Scale, a traditional Japanese scale
  shakuhachi: [2, 1, 4, 2, 3], // Shakuhachi Scale, used in traditional Japanese music
  // Add more scale types as needed...
};
