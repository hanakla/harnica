import { getDegreeNameFromKeyValue } from "./getDegreeNameFromKeyValue";
import { NoteQuality } from "../parser/types";
import { stringifyNoteQualities } from "../assemble/stringifyNoteQualities";
import { getKeyNameByKeyValue } from "../assemble/getKeyNameByKeyValue";
import { normalizeKeyValue } from "../key-calculation/normalizeKeyValue";

export function getChordDetailFromKeyValues(
  [...keyValues]: number[],
  baseOctave: number = 0,
  opt: { degree?: boolean } = {},
) {
  const baseOctaveKeyValue = baseOctave * 12;

  const slashValueIndex = keyValues.reduce(
    (a: null | number, v, idx) =>
      v < baseOctaveKeyValue ? Math.min(a ?? 0, idx) : a,
    null,
  );
  const slashValue =
    slashValueIndex != null ? keyValues[slashValueIndex] : null;

  const slashNote =
    slashValue != null
      ? opt.degree
        ? getDegreeNameFromKeyValue(slashValue)
        : getKeyNameByKeyValue(slashValue)
      : "";

  // Exclude slash note for chord inference
  if (slashValueIndex != null) keyValues.splice(slashValueIndex, 1);

  // find non negative root value
  let rootValue = keyValues.reduce(
    (a, v) => (v >= 0 ? Math.min(a, v) : a),
    Infinity,
  );

  // if all keys are negative, find the lowest value
  rootValue =
    rootValue === Infinity
      ? keyValues.reduce((a, b) => Math.min(a, b))
      : rootValue;

  const rootName = opt.degree
    ? getDegreeNameFromKeyValue(rootValue)
    : getKeyNameByKeyValue(rootValue);
  const qualities: NoteQuality[] = [];

  const intervals: number[] = [];
  const intervalsByRoot: number[] = [];

  keyValues.forEach((note, index) => {
    intervalsByRoot.push(note - keyValues[0]);

    if (index > 0) {
      intervals.push(normalizeKeyValue(note - Math.abs(keyValues[index - 1])));
    }
  });

  // Determine chord quality based on intervals
  const isDiminished =
    intervals[0] === 3 &&
    intervals[1] === 3 &&
    (intervals[2] == null || intervals[2] === 3);

  const isSus2 = intervals[0] === 2;
  const isSus4 = intervals[0] === 5;

  const isMajor = intervalsByRoot[1] === 4;
  // intervals[0] === 4 &&
  // intervals[1] === 3 &&
  // /* is 7th are major ? */ intervals[2] != null &&
  // intervals[2] === 4;
  const isMinor = intervalsByRoot[1] === 3; // intervals[0] === 3 && intervals[1] === 4;

  const isFlat5 = intervalsByRoot[2] === 6;
  const isSharp5 = intervalsByRoot[2] === 8;

  const isSeventh = intervals[2] != null;
  const isMinorSeventh = isMinor && intervals[2] === 3;
  const isMajorSeventh = isMajor && intervals[2] === 4;
  const hasNinth = keyValues.includes(rootValue + 14);
  const hasEleventh = keyValues.includes(rootValue + 17);
  const hasThirteenth = keyValues.includes(rootValue + 21);

  let isAugmented = false;
  for (let i = 0; i < intervals.length - 1; i++) {
    if (intervals[i] !== 4 || intervals[i + 1] !== 4) continue;

    isAugmented = true;
    break;
  }

  // Check for augmented seventh
  let isAugmentedSeventh = isAugmented && intervals[2] === 2;

  // Add chord quality to chord name
  if (isDiminished) {
    qualities.push(["dim", ""]);
  } else if (isSus2 || isSus4) {
    if (isSus2) qualities.push(["sus", "2"]);
    if (isSus4) qualities.push(["sus", "4"]);
  } else if (isAugmented) {
    qualities.push(["aug", ""]);
  } else if (isFlat5 || isSharp5) {
    qualities.push(["tune", isFlat5 ? "b" : "#", "5"]);
    if (isMajorSeventh) qualities.push(["quality", "M"]);
    if (isMinor || isMinorSeventh) qualities.push(["quality", "m"]);
  } else {
    // if chord isn't seventh, skip "M" sign
    if (isMajorSeventh) qualities.push(["quality", "M"]);
    if (isMinor || isMinorSeventh) qualities.push(["quality", "m"]);
  }

  if (hasThirteenth) qualities.push(["tension", "13"]);
  else if (hasEleventh) qualities.push(["tension", "11"]);
  else if (hasNinth) qualities.push(["tension", "9"]);
  else if (isSeventh || isMajorSeventh || isMinorSeventh || isAugmentedSeventh)
    qualities.push(["tension", "7"]);

  // Restore slash note
  if (slashValue != null) keyValues.unshift(slashValue);

  const qualityStr = stringifyNoteQualities(qualities);
  const chordName = rootName + qualityStr + (slashNote ? "/" + slashNote : "");

  return {
    octave: 0 as const, // TODO: correct it,
    rootKeyValue: rootValue,
    chordName: chordName,
    degreeName:
      getDegreeNameFromKeyValue(rootValue) +
      qualityStr +
      (slashValue != null ? getDegreeNameFromKeyValue(slashValue) : ""),
    rootKeyName: rootName,
    rootDegreeName: getDegreeNameFromKeyValue(rootValue),
    keysValues: keyValues,
    qualities,
  };
}
