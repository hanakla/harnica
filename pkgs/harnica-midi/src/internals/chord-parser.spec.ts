import { parseNoteQuality, parseSingleNote } from "./chord-parser";
import { NoteParseResult } from "./types";

describe.skip("chord-parser", () => {
  describe("parseNoteQuality", () => {
    it.each(
      // prettier-ignore
      [
        ['M7sus4', [['quality', 'M'], ['tension', '7'], ['sus', '4']]],
        ['m', [['quality', 'm']]],
        ['7', [['tension', '7']]],
        ['+7+9', [['tension', '7'], ['tension', '9']]],
        ['(#11)', [['tension', '#11']]],
        ['b9', [['tension', 'b9']]],
        ['b13', [['tension', 'b13']]],
        ['mM7', [['quality', 'm'], ['tension', 'M7']]],
        ['omit3', [['omit', '3']]],
        ['aug', [["aug", ""]]],
        ['aug7', [["aug", "7"]]],
        ["dim", [["dim", ""]]],
        ["dim7", [["dim", "7"]]],
      ],
    )("%s parsed to %s", (qualityStr, qualities) => {
      expect(parseNoteQuality(qualityStr)).toMatchObject(qualities);
    });
  });

  describe("parse notes to valid keys test", () => {
    it.only.each([
      ["C", ["C3", "E3", "G3"], [0, 4, 7]],
      ["Cm", ["C3", "D#3", "G3"], [0, 3, 7]],
      ["C7", ["C3", "E3", "G3", "A#3"], [0, 4, 7, 10]],
      ["Cm7", ["C3", "D#3", "G3", "A#3"], [0, 3, 7, 10]],
      ["Cmaj7", ["C3", "E3", "G3", "B3"], [0, 4, 7, 11]],
      ["CmM7", ["C3", "D#3", "G3", "B3"], [0, 3, 7, 11]],
      ["Csus4", ["C3", "F3", "G3"], [0, 5, 7]],
      ["Csus2", ["C3", "D3", "G3"], [0, 2, 7]],
      ["Caug", ["C3", "E3", "G#3"], [0, 4, 8]],
      ["Cdim", ["C3", "D#3", "F#3"], [0, 3, 6]],
      // ["Cm7b5", ["C3", "D#3", "F#3", "A#3"], [0, 3, 6, 10]],
    ])("parse %s", (input, expectedKeys, expectedValues) => {
      const note = parseSingleNote(input, "C") as NoteParseResult.ChordNote;
      expect(note.keys).toMatchObject(expectedKeys);
      expect(note.keyValues).toMatchObject(expectedValues);
    });
  });

  // describe("parseSingleNote", () => {
  //   it("English notations", () => {
  //     expect(parseSingleNote("C", "C")).toMatchInlineSnapshot(`
  //       {
  //         "detail": {
  //           "chordName": "C",
  //           "originalChordName": "C",
  //           "qualities": [],
  //           "root": "C",
  //           "warns": [],
  //         },
  //         "isDegree": false,
  //         "keyValues": [
  //           0,
  //           4,
  //           7,
  //         ],
  //         "keys": [
  //           "C3",
  //           "E3",
  //           "G3",
  //         ],
  //         "match": {
  //           "length": 1,
  //           "start": 0,
  //           "string": "C",
  //         },
  //         "octave": 0,
  //         "resolveKey": null,
  //         "type": "note",
  //       }
  //     `);

  //     expect(parseSingleNote("C-")).toMatchInlineSnapshot(`
  //       {
  //         "detail": {
  //           "chordName": "B",
  //           "originalChordName": "C-",
  //           "qualities": [],
  //           "root": "B",
  //           "warns": [],
  //         },
  //         "isDegree": false,
  //         "keyValues": [
  //           -1,
  //           3,
  //           6,
  //         ],
  //         "keys": [
  //           "B2",
  //           "D#3",
  //           "F#3",
  //         ],
  //         "match": {
  //           "length": 2,
  //           "start": 0,
  //           "string": "C-",
  //         },
  //         "octave": 0,
  //         "resolveKey": null,
  //         "type": "note",
  //       }
  //     `);
  //   });

  //   it.each(
  //     // prettier-ignore
  //     [
  //       ['IIsus4/V', { type: 'note', keyValues: [-5, 2, 7, 9], keys: ['G2', 'D3', 'G3', 'A3'], detail: { originalChordName: 'IIsus4/V' } }],
  //       ['III#M7(11)', { type: 'note', keyValues: [5, 9, 12, 15, 22], keys: ['F3', 'A3', 'C4', 'D#4', 'A#4'], detail: { originalChordName: 'III#M7(11)' } }],
  //       ['V#dim7/VII', { type: 'note', keyValues: [-1, 8, 11, 14, 17], keys: ['B2', 'G#3', 'B3', 'D4', 'F4'], detail: { originalChordName: 'V#dim7/VII' } }],
  //       // Spaced
  //       [' V#dim7/VII ', { type: 'note', keyValues: [-1, 8, 11, 14, 17], keys: ['B2', 'G#3', 'B3', 'D4', 'F4'], detail: { originalChordName: 'V#dim7/VII' } }]
  //     ]
  //   )("work with degree notation", (input, expected) => {
  //     expect(parseSingleNote(input)).toMatchObject(expected);
  //   });

  //   it("detect key change", () => {
  //     expect(parseSingleNote("Key=C#", "C")).toEqual({
  //       type: "keyChange",
  //       key: "C#",
  //       match: {
  //         start: 0,
  //         length: 6,
  //         string: "Key=C#",
  //       },
  //     });
  //   });

  //   it("omit", () => {
  //     const result1 = parseSingleNote("C7omit3", "C") as NoteParseResult.Note;
  //     expect(result1.keys).toEqual(["C3", "G3", "Bb3"]);

  //     const result2 = parseSingleNote("C7-3", "C") as NoteParseResult.Note;
  //     expect(result2.keys).toEqual(["C3", "G3", "A#3"]);
  //   });

  //   it("negative octave", () => {
  //     const result = parseSingleNote("-A", "C", 2) as NoteParseResult.Note;
  //     expect(result.keys).toEqual(["A1", "C#2", "E2"]);
  //   });

  //   it("positive octave", () => {
  //     const result = parseSingleNote("+A", "C", 2) as NoteParseResult.Note;
  //     expect(result.keys).toEqual(["A3", "C#4", "E4"]);
  //   });

  //   it("test", () => {
  //     // const matcher = /^([IV]+?[#b]?)([^/]*?)(?:\/([IV]+))?(omit\d+)?$/g;
  //     // console.log(matcher.exec("VII#maj7add9sus4/VII"));
  //   });
  // });

  // describe("parseChordProgression", () => {
  //   // it("test space", () => {
  //   //   console.log(
  //   //     parseChordProgression(
  //   //       `
  //   //     | Bm7 C#m7 | Em7 F#m7 | Em7 | F#m7 Bm7(11) |
  //   //     | Em7 F#m7 | Am7(9) F#sus4/G# | GM7(#11) CM7(#11) | FM7(#11)F#m/B |
  //   //   `,
  //   //       "C",
  //   //       4
  //   //     )
  //   //   );
  //   // });

  //   it("should parse chord progression", () => {
  //     const prog = `A#m7 _ # | AonG`;

  //     expect(parseChordProgression(prog, "C", 4)).toMatchSnapshot();
  //   });

  //   it("should parse with key change", () => {
  //     expect(parseChordProgression("C | Key=D I", "C", 4)).toMatchSnapshot();
  //   });

  //   it("should parse with Signature", () => {
  //     expect(
  //       parseChordProgression("Sig=Ab,Bb I | II", "C", 4)
  //     ).toMatchSnapshot();
  //   });

  //   it.skip("should parse with group", () => {
  //     const actual = parseChordProgression("[ C B ]  |", "C", 4);
  //     // console.log(actual);
  //     expect(pick(actual[0], "noteIdx", "key", "duration")).toMatchObject({
  //       noteIdx: 0,
  //       key: "C",
  //       duration: {
  //         beatBlock: [0, 2, 0],
  //       },
  //     });

  //     expect(actual[0]).toMatchObject({
  //       noteIdx: 1,
  //       key: "B",
  //       duration: {
  //         beatBlock: [0, 2, 0],
  //       },
  //     });
  //   });
  // });

  // describe("matchChordProgression", () => {
  //   it("should work", () => {
  //     const prog = matchChordProgression(
  //       " C#m7  | Am7 | G _ _ # | Em/B | Key=C"
  //     );

  //     expect(prog).toMatchSnapshot();
  //   });
  // });

  // describe("normalizeBeatClock", () => {
  //   it("work?", () => {
  //     expect(normalizeBeatClock([0, 4, 0], 4)).toMatchObject([1, 0, 0]);
  //     expect(normalizeBeatClock([0, 0, 4], 4)).toMatchObject([0, 1, 0]);
  //     expect(normalizeBeatClock([0, 0.5, 0], 4)).toMatchObject([0, 0, 2]);
  //   });
  // });

  // describe("sougo", () => {
  //   it("C#m7", () => {
  //     const note = parseSingleNote("C#m7") as NoteParseResult.Note;
  //     expect(getChordDetailFromKeyValues(note.keyValues).chordName).toBe(
  //       "C#m7"
  //     );
  //   });
  // });

  it.only.each([
    [`C#m7 | Am7 | G _ \n _ # | Em/B | Key=C`],
    [`Key=C\n\nC#m7 | Am7 | G _ \n _ # | Em/B \n`],
  ])("multi-line chord can be restore to original string", (prog) => {
    const restored = matchChordProgression(prog)
      .map((n) => n.match.string)
      .join("");

    expect(restored).toBe(prog);
  });
});

const pick = <T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> => {
  const ret = {} as Pick<T, K>;
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
};
