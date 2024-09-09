import { parseStringAsSingleChordNote } from "../parser/chord-parser-2";
import { convertChordNoteToChordIR } from "./convertChordNoteToChordIR";

describe("convertChordNoteToChordIR", () => {
  it("same chord with different key", () => {
    const a = convertChordNoteToChordIR(
      parseStringAsSingleChordNote("I", "C")!,
    )!;
    const b = convertChordNoteToChordIR(
      parseStringAsSingleChordNote("I", "A")!,
    )!;

    expect(a).not.toBe(b.root);
  });
});
