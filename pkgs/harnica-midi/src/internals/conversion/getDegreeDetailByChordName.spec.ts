import { getDegreeDetailByChordName } from "./getDegreeDetailByChordName";

describe("getDegreeDetailByChordName", () => {
  it("work?", () => {
    expect(getDegreeDetailByChordName("C", "C")?.chordName).toBe("I");
    expect(getDegreeDetailByChordName("D", "C")?.chordName).toBe("II");
    expect(getDegreeDetailByChordName("+D", "C")?.chordName).toBe("II");
    expect(getDegreeDetailByChordName("C", "F")?.chordName).toBe("V");
    expect(getDegreeDetailByChordName("A#", "C")?.chordName).toBe("VI#");
    expect(getDegreeDetailByChordName("G", "D")?.chordName).toBe("IV");
  });
});
