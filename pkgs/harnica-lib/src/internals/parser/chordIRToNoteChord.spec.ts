import { chordIRToNoteChord } from "./chordIRToNoteChord";
import { NoteQuality } from "./types";

describe("chordIRToNoteChord", () => {
  it("converts chordIR to note chord", () => {
    const result = chordIRToNoteChord(
      {
        root: 0,
        applyKey: { key: "C", major: true, minor: false },
        octave: 0,
        qualities: [],
        slash: null,
        warns: [],
        omitted: void 0,
      },
      false,
      4,
    );

    expect(result).toEqual({
      keys: ["C4", "E4", "G4"],
      keyValues: [48, 52, 55],
      octave: 0,
      isDegree: false,
      appliedKey: "C",
      detail: {
        octaveValue: 4,
        appliedKey: { key: "C", major: true, minor: false },
        rootName: "C",
        rootKeyValue: 48,
        rootDegreeName: "I",
        originalChordName: "C",
        chordName: "C",
        qualities: [],
        slashKeyValue: null,
        warns: [],
      },
    });
  });

  it.each(
    // prettier-ignore
    [
      ['BM-5', { root: 11, qualities: [['quality', 'M'], ['tune', 'b', '5']] as NoteQuality[] }, [11, 15, 17]],
    ],
  )("keyValues check for %s, %j to be %j", (_, input, expected) => {
    const result = chordIRToNoteChord(
      {
        root: input.root,
        applyKey: { key: "C", major: true, minor: false },
        octave: 0,
        qualities: input.qualities,
        slash: null,
        warns: [],
        omitted: void 0,
      },
      false,
      0,
    );

    expect(result.keyValues).toEqual(expected);
  });
});
