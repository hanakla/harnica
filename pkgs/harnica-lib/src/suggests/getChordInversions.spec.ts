import { getChordInversions } from "./getChordInversions";

describe("getChordInversions", () => {
  it("works 1st inversion", () => {
    expect(getChordInversions("C", 1)).toMatchObject({
      chordName: "Em+5",
      keys: ["E", "G", "C"],
      keyValues: [4, 7, 12],
    });
  });

  it("works 2nd inversion", () => {
    expect(getChordInversions("C", 2)).toMatchObject({
      chordName: "Gsus4",
      keys: ["G", "C", "E"],
      keyValues: [7, 12, 16],
    });
  });

  it("works with 7th chord", () => {
    expect(getChordInversions("CM7", 1)).toMatchObject({
      chordName: "Em7",
      keys: ["E", "G", "B", "C"],
      keyValues: [4, 7, 11, 12],
    });
  });
});
