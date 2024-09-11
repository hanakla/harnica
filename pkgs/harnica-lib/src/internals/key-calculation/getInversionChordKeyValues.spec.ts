import { getInversionChordKeyValues } from "./getInversionChordKeyValues";

describe("getInversionChordKeyValues", () => {
  it("to positive", () => {
    expect(getInversionChordKeyValues([0, 4, 7], 1)).toEqual([4, 7, 12]);
    expect(getInversionChordKeyValues([0, 4, 7], 2)).toEqual([7, 12, 16]);
  });

  it("to negative", () => {
    expect(getInversionChordKeyValues([0, 4, 7], -1)).toEqual([-5, 0, 4]);
    expect(getInversionChordKeyValues([0, 4, 7], -2)).toEqual([-8, -5, 0]);
  });
});
