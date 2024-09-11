export * as analysis from "./analysis/index";
export * as suggests from "./suggests/index";

export {
  type NoteFragment,
  type NoteFragmentType,
} from "./internals/parser/types";

export {
  parseChordProgression,
  parseStringAsSingleChordNote,
} from "./internals/parser/chord-parser-2";
export { resolveDegreeKeyValue, resolveNote } from "./internals/calc-keys";
export { normalizeKeyValue } from "./internals/key-calculation/normalizeKeyValue";
export { getChordInversions } from "./suggests/getChordInversions";

export * as beatclock from "./internals/beatclock";

export {
  getKeyNamesByKeyValues as getKeyStringsByKeyValues,
  formatNote,
} from "./internals/chord-assembler";
export { getKeyNameByKeyValue } from "./internals/assemble/getKeyNameByKeyValue";

export { getDegreeDetailByChordName } from "./internals/conversion/getDegreeDetailByChordName";
export { getDegreeNameFromKeyValue } from "./internals/conversion/getDegreeNameFromKeyValue";
export { getChordDetailFromKeyValues } from "./internals/conversion/getChordDetailFromKeyValues";

export { getModifiedChord } from "./endpoints/manipulation";
export { progressionToMidi } from "./exporter/midi";
