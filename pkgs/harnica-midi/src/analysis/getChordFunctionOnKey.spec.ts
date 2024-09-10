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
      { chord: "I", key: "C", actual: { ...allFalse, tonic: true, } },
      { chord: "V", key: "C", actual: { ...allFalse, dominant: true } },
      { chord: "IV", key: "C", actual: { ...allFalse, subdominant: true } },
      { chord: "IIm", key: "C", actual: { ...allFalse, secondSubDominant: true } },
      { chord: "IIIm", key: "C", actual: { ...allFalse, secondTonic: true } },
      { chord: "VIm", key: "C", actual: { ...allFalse, thirdTonic: true } },
      { chord: "VIIm-5", key: "C", actual: { ...allFalse, secondDominant: true } },
      { chord: "I7", key: "C", actual: { ...allFalse, tonic: true } },

      { chord: "I", key: "D", actual: { ...allFalse, tonic: true, } },
      { chord: "V", key: "D", actual: { ...allFalse, dominant: true } },
      { chord: "IV", key: "D", actual: { ...allFalse, subdominant: true } },
      { chord: "IIm", key: "D", actual: { ...allFalse, secondSubDominant: true } },
      { chord: "IIIm", key: "D", actual: { ...allFalse, secondTonic: true } },
      { chord: "VIm", key: "D", actual: { ...allFalse, thirdTonic: true } },
      { chord: "VIIm-5", key: "D", actual: { ...allFalse, secondDominant: true } },
      { chord: "I7", key: "D", actual: { ...allFalse, tonic: true } },

      { chord:'D', key: 'D', actual: { ...allFalse, tonic: true } },
      { chord: 'G', key: 'D', actual: { ...allFalse, subdominant: true } },
      { chord: 'A', key: 'D', actual: { ...allFalse, dominant: true } },
      { chord: 'F#m', key: 'D', actual: { ...allFalse, secondTonic: true } },

      // sameroot
      // { chord: "IVsus4", key: "F", actual: { ...allFalse, dominant: "sameRoot" } },
    ] satisfies Array<{ chord: string; key: string; actual: ChordFunctionMatch }>,
  )("works for $chord on $key", ({ chord, key, actual }) => {
    expect(getChordFunctionOnKey(chord, key).data).toMatchObject(actual);
  });
});
