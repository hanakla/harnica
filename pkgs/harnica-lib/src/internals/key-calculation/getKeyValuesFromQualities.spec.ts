import { getKeyValuesFromQualities } from "./getKeyValuesFromQualities";

describe("getKeyValuesFromQualities", () => {
  it("Major, minor", () => {
    expect(getKeyValuesFromQualities([])).toEqual([0, 4, 7]);
    expect(getKeyValuesFromQualities([["quality", "M"]])).toEqual([0, 4, 7]);
    expect(getKeyValuesFromQualities([["quality", "m"]])).toEqual([0, 3, 7]);
  });

  it.each(
    // prettier-ignore
    [
      // normal syntax
      // { quality: [['tension', '6']], keys: [0, 4, 7, 9] },
      // { quality: [['tension', '7']], keys: [0, 4, 7, 10] },
      // { quality: [['quality', 'M'], ['tension', '7']], keys: [0, 4, 7, 11] },
      // { quality: [['quality', 'm'], ['tension', '7']], keys: [0, 3, 7, 10] },
      // { quality: [['tension', '9']], keys: [0, 4, 7, 11, 14] },
      // { quality: [['tension', '11']], keys: [0, 4, 7, 11, 14, 17] },
      // { quality: [['tension', '13']], keys: [0, 4, 7, 11, 14, 17, 21] },
    ],
  )("tension $quality tobe keys $keys", ({ quality, keys }) => {
    expect(
      getKeyValuesFromQualities(quality as any),
      `${quality[0]} ${quality[1]}`,
    ).toEqual(keys);
  });

  it.each(
    // prettier-ignore
    [
      [['b', "5"], [0, 4, 6]],
      [['#', "5"], [0, 4, 8]],
    ] as const,
  )("-5,+5", (input, keyValues) => {
    expect(getKeyValuesFromQualities([["tune", ...input]])).toEqual(keyValues);
  });

  it("dim", () => {
    expect(getKeyValuesFromQualities([["dim", ""]])).toEqual([0, 3, 6]);
    expect(getKeyValuesFromQualities([["dim", "7"]])).toEqual([0, 3, 6, 9]);
  });

  it("aug", () => {
    expect(getKeyValuesFromQualities([["aug", ""]])).toEqual([0, 4, 8]);

    expect(getKeyValuesFromQualities([["aug", "7"]])).toEqual([0, 4, 8, 10]);

    expect(
      getKeyValuesFromQualities([
        ["quality", "M"],
        ["aug", "7"],
      ]),
    ).toEqual([0, 4, 8, 11]);
  });

  it("add", () => {
    // C, E, G, D
    expect(getKeyValuesFromQualities([["add", "7"]])).toEqual([0, 4, 7, 11]);
    expect(getKeyValuesFromQualities([["add", "9"]])).toEqual([0, 4, 7, 14]);
    expect(getKeyValuesFromQualities([["add", "b9"]])).toEqual([0, 4, 7, 13]);
    expect(getKeyValuesFromQualities([["add", "#9"]])).toEqual([0, 4, 7, 15]);
  });

  it("sus", () => {
    expect(getKeyValuesFromQualities([["sus", "2"]])).toEqual([0, 2, 7]);
    expect(getKeyValuesFromQualities([["sus", "4"]])).toEqual([0, 5, 7]);
    expect(getKeyValuesFromQualities([["sus", "4"]])).toEqual([0, 5, 7]);
  });
});
