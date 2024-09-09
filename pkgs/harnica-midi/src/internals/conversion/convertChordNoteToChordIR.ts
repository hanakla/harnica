import { getKeyValueByKeyName } from "../key-calculation/getKeyValueBy";
import { ChordIR, NoteFragment } from "../parser/types";

export function convertChordNoteToChordIR({
  chord,
}: NoteFragment.ChordNote): ChordIR | null {
  const keyKeyValue =
    chord.detail.appliedKey?.key != null
      ? getKeyValueByKeyName(chord.detail.appliedKey.key)
      : 0;

  if (chord.isDegree) {
    return {
      root: chord.detail.rootKeyValue - keyKeyValue,
      applyKey: chord.detail.appliedKey,
      octave: chord.octave,
      qualities: chord.detail.qualities,
      slash: chord.detail.slashKeyValue
        ? chord.detail.slashKeyValue - keyKeyValue
        : null,
      warns: [],
      omitted: undefined, // TODO: Implement omitted
    };
  } else {
    return {
      root: chord.detail.rootKeyValue - keyKeyValue,
      applyKey: chord.detail.appliedKey,
      octave: chord.octave,
      qualities: chord.detail.qualities,
      slash: chord.detail.slashKeyValue
        ? chord.detail.slashKeyValue - keyKeyValue
        : null,
      warns: [],
      omitted: undefined, // TODO: Implement omitted
    };
  }
}
