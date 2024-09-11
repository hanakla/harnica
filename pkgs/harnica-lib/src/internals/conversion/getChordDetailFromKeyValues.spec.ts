import { parseStringAsSingleChordNote } from "../parser/chord-parser-2";
import { getChordDetailFromKeyValues } from "./getChordDetailFromKeyValues";

describe("getChordDetailFromKeyValues", () => {
  it.each([
    ["C", "C"],
    ["Cdim7", "C7dim"],
    ["Caug7", "C7aug"],
    ["CM7", "CM7"],
    ["Cm7", "Cm7"],
    ["Cm7/G", "Cm7/G"],
    ["C7sus2", "C7sus2"],
    ["Cm9", "Cm9"],
    ["Cm11", "Cm11"],
    ["Cm13", "Cm13"],

    // // Boss
    ["G7", "G7"],
    ["B-5", "B-5"],
    ["Bm-5", "Bdim"],
    ["BM-5", "B-5"],
    ["Bm+5", "Bm+5"],
  ])("work for %s?", (source, expectStr) => {
    const note = parseStringAsSingleChordNote(source, "C", 0)!;

    // if (note!.chord.detail.warns.length > 0)
    //   console.warn(note!.chord.detail.warns);

    const actual = getChordDetailFromKeyValues(note!.chord.keyValues, 0);
    expect(actual.chordName).toBe(expectStr);
    expect(actual.keysValues).toEqual(note?.chord.keyValues);
  });
});
