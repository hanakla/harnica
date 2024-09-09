import { DEFAULT_OCTAVE } from "./constants";
import { getKeyNamesByKeyValues } from "./chord-assembler";
import { getChordDetailFromKeyValues } from "./conversion/getChordDetailFromKeyValues";
import { getDegreeNameFromKeyValue } from "./conversion/getDegreeNameFromKeyValue";
import { getKeyValueByKeyName } from "./key-calculation/getKeyValueBy";
import { NoteFragment } from "./parser/types";
import { parseApplyKeyString } from "./parser/parseKeyChange";
import { assertKeyString } from "./types";

export function createNoteNote(
  keyValues: number[],
  degree: boolean,
  key: string | null = null,
  baseOctave: number = DEFAULT_OCTAVE,
): NoteFragment.ChordNote {
  if (key != null) assertKeyString(key);

  const chord = getChordDetailFromKeyValues(keyValues);
  let originalChordName = chord.chordName;

  if (degree) {
    chord.rootKeyName = getDegreeNameFromKeyValue(
      getKeyValueByKeyName(chord.rootKeyName),
      baseOctave,
    );
  }

  return {
    type: "chord",
    fragIndex: 0,
    isSoundable: true,
    noteIndex: 0,
    time: {
      startAt: {
        beatClock: [0, 0, 0],
        beatClockStr: "0:0:0",
      },
      duration: {
        beatClock: [1, 0, 0],
        beatClockStr: "1:0:0",
        tick: "T0",
      },
    },
    chord: {
      keys: getKeyNamesByKeyValues(keyValues, baseOctave),
      keyValues,
      octave: chord.octave,
      isDegree: degree,
      appliedKey: key,
      detail: {
        rootName: chord.rootKeyName,
        rootDegreeName: chord.rootDegreeName,
        chordName: chord.chordName,
        octaveValue: baseOctave + chord.octave,
        appliedKey: key ? parseApplyKeyString(key) : null,
        rootKeyValue: chord.rootKeyValue,
        slashKeyValue: null, // TODO: Implement slash,
        originalChordName,
        qualities: chord.qualities,
        warns: [],
      },
    },
    match: {
      start: 0,
      end: 0,
      length: 0,
      string: chord.chordName,
    },
  };
}
