import { getScaleChords } from "./getScaleChords";

describe("getScaleChords", () => {
  it("works with major scale", () => {
    const actual = getScaleChords("C", "major");
    const chordNames = actual.map((c) => c.chordName);
    expect(chordNames).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
  });

  it("works with major scale", () => {
    const actual = getScaleChords("C", "major", { degree: true });
    const chordNames = actual.map((c) => c.chordName);

    expect(chordNames).toEqual([
      "I",
      "IIm",
      "IIIm",
      "IV",
      "V",
      "VIm",
      "VIIdim",
    ]);
  });
});
