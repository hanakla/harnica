import { parseStringAsSingleChordNote } from "../internals/parser/chord-parser-2";
import { getKeyValueByKeyName } from "@/internals/key-calculation/getKeyValueBy";
import { ChordSuggest, toDegreeSuggest } from "@/suggests/toDegreeSuggest";
import { getKeyNameByKeyValue } from "..";

export function getScaleChords(
  key: string,
  type: keyof typeof scaleKeys,
  { degree = false }: { degree?: boolean } = {},
): ChordSuggest[] {
  key = getKeyNameByKeyValue(getKeyValueByKeyName(key)!);
  const scaleNotes = scaleKeys[type];

  // Create the chords
  return scaleNotes.map((chord) => {
    const note = parseStringAsSingleChordNote(chord, key)!.chord;

    const suggest: ChordSuggest = {
      root: note.detail.rootName,
      chordName: note.detail.chordName,
      resolvedChordName: note.detail.chordName,
      keys: note.keys,
      keyValues: note.keyValues,
      relativeOctave: note.keyValues[0] > 12 ? 1 : 0,
    };

    return degree ? toDegreeSuggest(suggest, key) : suggest;
  });
}

export const scaleKeys = {
  major: ["IM", "IIm", "IIIm", "IVM", "VM", "VIm", "VIIdim"],
  minor: ["Im", "IIdim", "IIIM", "IVm", "Vm", "VIM", "VIIM"],
  harmonicMinor: ["Im", "IIdim", "IIIAug", "IVm", "VM", "VIM", "VIIdim"],
  melodicMinor: ["Im", "IIm", "IIIAug", "IVM", "VM", "VIdim", "VIIdim"],
  harmonicMajor: ["IM", "IIm", "IIIm", "IVm", "VM", "VIm", "VIIdim"],
  pentatonic: ["IM", "IIm", "IIIm", "VM", "VIm"],
  blues: ["IM", "IIIm", "IVM", "VM", "VIm", "VIIm"],
  dorian: ["Im", "IIm", "IIIM", "IVM", "Vm", "VIdim", "VIIM"],
  phrygian: ["Im", "IIM", "IIIM", "IVm", "Vdim", "VIM", "VIIm"],
  lydian: ["IM", "IIM", "IIIm", "IVdim", "VM", "VIm", "VIIm"],
  mixolydian: ["IM", "IIm", "IIIdim", "IVM", "Vm", "VIm", "VIIM"],
  locrian: ["Idim", "IIm", "IIIm", "IVm", "VM", "VIm", "VIIm"],
  arabian: ["Im", "IIM", "IIIm", "IVM", "Vm", "VIM", "VIIm"],
  hirajoshi: ["IM", "IIm", "IIIm", "VM", "VIm"],
  shakuhachi: ["IM", "IIm", "IIIm", "VM", "VIm"],
  // Add more scale types as needed...
};
