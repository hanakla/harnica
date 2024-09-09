import { getSubstitutionChords } from "./getSubstitutionChords";

describe("getSubstitutionChords", () => {
  it("work?", () => {
    const actual1 = getSubstitutionChords("C", "major");
    expect(actual1.vi.chordName).toBe("Am");
    expect(actual1.iii.chordName).toBe("Em");

    const actual2 = getSubstitutionChords("Am", "major");
    expect(actual2.vi.chordName).toBe("F#m");
    expect(actual2.iii.chordName).toBe("C#m");

    const actual3 = getSubstitutionChords("C", "minor");
    expect(actual3.vi.chordName).toBe("G#");
    expect(actual3.iii.chordName).toBe("D#");
  });

  it("work with degree", () => {
    const actual = getSubstitutionChords("C", "major", "C", { degree: true });
    expect(actual.vi.chordName).toBe("VIm");
    expect(actual.iii.chordName).toBe("IIIm");
  });
});
