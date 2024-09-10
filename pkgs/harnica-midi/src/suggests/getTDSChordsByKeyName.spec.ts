import {
  FunctionChordResults,
  getTDSChordsByKeyName,
} from "./getTDSChordsByKeyName";

describe(getTDSChordsByKeyName.name, () => {
  it.each(
    // prettier-ignore
    [
      { k: 'C', func: "tonic", chord: "C", keys: [0, 4, 7] },
      { k: 'C', func: "secondTonic", chord: "Em", keys: [4, 7, 11] },
      { k: 'C', func: "thirdTonic", chord: "Am", keys: [9, 12, 16] },
      { k: 'C', func: "dominant", chord: "G", keys: [7, 11, 14] },
      { k: 'C', func: "secondDominant", chord: "Bm-5", keys: [11, 15, 17] },
      { k: 'C', func: "subdominant", chord: "F", keys: [5, 9, 12] },
      { k: 'C', func: "secondSubDominant", chord: "Dm", keys: [2, 5, 9] },

      { k: 'D', func: "tonic", chord: "D", keys: [2, 6, 9] },
      { k: 'D', func: "secondTonic", chord: "F#m", keys: [6, 9, 13] },
      { k: 'D', func: "thirdTonic", chord: "Bm", keys: [11, 14, 18] },
      { k: 'D', func: "dominant", chord: 'A', keys: [9, 13, 16] },
      { k: 'D', func: "secondDominant", chord: 'C#m-5', keys: [13, 17, 19] },
      { k: 'D', func: "subdominant", chord: 'G', keys: [7, 11, 14] },
      { k: 'D', func: "secondSubDominant", chord: 'Em', keys: [4, 7, 11] },
    ] satisfies Array<{ k: string, func: keyof FunctionChordResults; chord: string; keys: number[] }>,
  )("$func in key=$k", ({ k, func, chord, keys }) => {
    const result = getTDSChordsByKeyName(k).data!;

    console.log(result);

    expect(result[func]).toMatchObject({
      chordName: chord,
      keyValues: keys,
    });
  });
});
