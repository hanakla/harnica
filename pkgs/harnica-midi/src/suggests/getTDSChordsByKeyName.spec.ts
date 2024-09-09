import {
  FunctionChordResults,
  getTDSChordsByKeyName,
} from "./getTDSChordsByKeyName";

describe(getTDSChordsByKeyName.name, () => {
  it.only.each(
    // prettier-ignore
    [
      { func: "tonic", chord: "C", keys: [0, 4, 7] },
      { func: "secondTonic", chord: "Em", keys: [4, 7, 11] },
      { func: "thirdTonic", chord: "Am", keys: [9, 12, 16] },
      { func: "dominant", chord: "G", keys: [7, 11, 14] },
      { func: "secondDominant", chord: "Bm-5", keys: [11, 15, 17] },
      { func: "subdominant", chord: "F", keys: [5, 9, 12] },
      { func: "secondSubDominant", chord: "Dm", keys: [2, 5, 9] },
    ] satisfies Array<{ func: keyof FunctionChordResults; chord: string; keys: number[] }>,
  )("$func in key=C", ({ func, chord, keys }) => {
    const result = getTDSChordsByKeyName("C").data!;

    expect(result[func]).toMatchObject({
      chordName: chord,
      keyValues: keys,
    });
  });

  // it.each([
  //   ["tonic", "E", [4, 8, 11]],
  //   ["dominant", "B", [11, 15, 18]],
  //   ["subdominant", "A", [9, 13, 16]],
  //   ["secondSubdominant", "F#m", [6, 9, 13]],
  //   ["thirdTonic", "G#m", [8, 11, 15]],
  //   ["sixthTonic", "C#m", [1, 4, 8]],
  //   ["seventhDominant", "D#dim", [3, 6, 9]],
  // ])("%s in E", (prop, chordName, keys) => {
  //   const result = getTDSChordsByKeyName("E")!;
  //   expect(result[prop]).toMatchObject({
  //     chordName,
  //     keyValues: keys,
  //   });
  // });
});
