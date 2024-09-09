import {
  ChordFunctionMatch,
  getChordFunctionOnKey,
} from "./getChordFunctionOnKey";

describe("getChordFunctionOnKey", () => {
  const allFalse = {
    tonic: false,
    dominant: false,
    secondDominant: false,
    secondSubDominant: false,
    secondTonic: false,
    subdominant: false,
    thirdTonic: false,
  } as const;

  it.only.each(
    // prettier-ignore
    [
      { chord: "I", key: "C", actual: { ...allFalse, tonic: "perfect", } },
      { chord: "V", key: "C", actual: { ...allFalse, dominant: "perfect" } },
      { chord: "IV", key: "C", actual: { ...allFalse, subdominant: "perfect" } },
      { chord: "IIm", key: "C", actual: { ...allFalse, secondSubDominant: "perfect" } },
      { chord: "IIIm", key: "C", actual: { ...allFalse, secondTonic: "perfect" } },
      { chord: "VIm", key: "C", actual: { ...allFalse, thirdTonic: "perfect" } },
      { chord: "VIIm-5", key: "C", actual: { ...allFalse, secondDominant: "perfect" } },
      { chord: "I7", key: "C", actual: { ...allFalse, tonic: "perfect" } },

      // sameroot
      { chord: "IVsus4", key: "F", actual: { ...allFalse, dominant: "sameRoot" } },
    ] satisfies Array<{ chord: string; key: string; actual: ChordFunctionMatch }>,
  )("works for $chord on $key", ({ chord, key, actual }) => {
    expect(getChordFunctionOnKey(chord, key).data).toMatchObject(actual);
  });
});
