import { describe, expect, it } from "vitest";
import {
  parseChordProgression,
  parseStringAsSingleChordNote,
} from "./chord-parser-2";

describe("chord-parser-2", () => {
  describe(parseChordProgression.name, () => {
    it("parseChordProgression", () => {
      const progStr =
        "Key=A C | Am | Fm (Dm G7)\n # COMMENT\n I | Gsus4 IIm | IIIadd4/V # COMMENT # I";
      const progression = parseChordProgression(progStr, "C", 4, 1);

      const preGroupNote = progression.find(
        (n) => n.chord?.detail.originalChordName === "Fm",
      );
      const inGroupNote = [
        progression.find((n) => n.chord?.detail.originalChordName === "Dm"),
        progression.find((n) => n.chord?.detail.originalChordName === "G7"),
      ];

      expect(progression.map((n) => n.match.string)).toMatchSnapshot();
      expect(
        progression
          .map((n) => n.chord?.detail.originalChordName)
          .filter(Boolean),
      ).toMatchSnapshot();

      expect(preGroupNote?.time?.duration.beatClock).toEqual([0, 2, 0]);
      expect(inGroupNote[0]?.time?.duration.beatClock).toEqual([0, 1, 0]);
      expect(inGroupNote[1]?.time?.duration.beatClock).toEqual([0, 1, 0]);
      expect(progression.map((n) => n.match.string).join("")).toEqual(progStr);

      const types = progression.map((n) => n.type);
      expect(types).toMatchInlineSnapshot(`
        [
          "keyChange",
          "characters",
          "chord",
          "characters",
          "barSeparator",
          "characters",
          "chord",
          "characters",
          "barSeparator",
          "characters",
          "chord",
          "characters",
          "braceBegin",
          "chord",
          "characters",
          "chord",
          "barSeparator",
          "characters",
          "comment",
          "characters",
          "chord",
          "characters",
          "barSeparator",
          "characters",
          "chord",
          "characters",
          "chord",
          "characters",
          "barSeparator",
          "characters",
          "chord",
          "characters",
          "comment",
          "characters",
          "chord",
        ]
      `);

      const startAts = progression
        .map((n) => n.time?.startAt?.beatClock)
        .filter((n): n is Exclude<typeof n, undefined> => n != null);

      // console.log(
      //   progression
      //     .filter((n) => !!n.time?.startAt?.beatClock)
      //     .filter((n): n is Exclude<typeof n, undefined> => n != null),
      // );
      expect(startAts).toEqual([
        // Cm
        [0, 0, 0],
        // Am
        [1, 0, 0],
        // Fm (Dm G7)
        [2, 0, 0],
        [2, 2, 0],
        [2, 3, 0],
        // I
        [3, 0, 0],
        // Gsus4 IIm
        [4, 0, 0],
        [4, 2, 0],
        // IIIadd4/V I
        [5, 0, 0],
        [5, 2, 0],
        // I
        [6, 0, 0],
      ]);
    });

    it("triads", () => {
      const key = "C";

      const tonic = parseStringAsSingleChordNote("IM", key)!.chord;
      const secondTonic = parseStringAsSingleChordNote("VIm", key)!.chord;
      const thirdTonic = parseStringAsSingleChordNote("IIIm", key)!.chord;
      const dominant = parseStringAsSingleChordNote("V", key)!.chord;
      const secondDominant = parseStringAsSingleChordNote("VIIm", key)!.chord;
      const subdominant = parseStringAsSingleChordNote("IV", key)!.chord;
      const secondSubDominant = parseStringAsSingleChordNote("IIm", key)!.chord;

      expect(tonic.detail.originalChordName).toEqual("I");
      expect(secondTonic.detail.originalChordName).toEqual("VIm");
      expect(thirdTonic.detail.originalChordName).toEqual("IIIm");
      expect(dominant.detail.originalChordName).toEqual("V");
      expect(secondDominant.detail.originalChordName).toEqual("VIIm");
      expect(subdominant.detail.originalChordName).toEqual("IV");
      expect(secondSubDominant.detail.originalChordName).toEqual("IIm");
    });

    it("Boss rush", () => {
      const case1 = parseChordProgression("Gm7(9)");
      expect(case1).toHaveLength(1);
      expect(case1[0].chord?.detail.chordName).toEqual("Gm7(9)");
      expect(case1[0].chord?.detail.qualities).toEqual([
        ["quality", "m"],
        ["tension", "7"],
        ["tension", "9"],
      ]);

      const case2 = parseChordProgression("F#7(b9)");
      expect(case2).toHaveLength(1);

      const case3 = parseChordProgression("VIm", "C", 4, 0)!;
      expect(case3).toHaveLength(1);
      expect(case3[0].chord?.detail.originalChordName).toEqual("VIm");
      expect(case3[0].chord?.keyValues).toEqual([9, 12, 16]);

      const case4 = parseChordProgression("G7", "C", 4, 0)!;
      expect(case4).toHaveLength(1);
      expect(case4[0].chord?.keyValues).toEqual([7, 11, 14, 17]);

      const case5 = parseChordProgression("VIIb5", "C", 4, 0)!;
      expect(case5).toHaveLength(1);
      expect(case5[0].chord?.detail.originalChordName).toEqual("VII-5");

      const case6 = parseChordProgression("+I", "C", 4, 0)!;
      expect(case6).toHaveLength(1);
      expect(case6[0].chord?.detail.rootKeyValue).toEqual(12);
      expect(case6[0].chord?.keys[0]).toEqual("C1");

      const case7 = parseChordProgression("I-5 G-5", "C", 4, 0)!;
      expect(case7).toHaveLength(3);
      expect(case7[0].chord?.detail.qualities).toEqual([["tune", "b", "5"]]);
      expect(case7[0].chord?.detail.originalChordName).toEqual("I-5");
      expect(case7[1].type).toEqual("characters");
      expect(case7[2].chord?.detail.qualities).toEqual([["tune", "b", "5"]]);
      expect(case7[2].chord?.detail.originalChordName).toEqual("G-5");

      const case8 = parseStringAsSingleChordNote("I/I", "C", 0);
      expect(case8?.chord.detail.slashKeyValue).toEqual(0);
    });

    it("keychange", () => {
      const actual = parseChordProgression("Key=C I | Key=A I", "C", 4, 0);
      expect(actual).toHaveLength(9);
      expect(actual[2].chord!).toMatchObject({
        appliedKey: "C",
        keys: { 0: "C0" },
        keyValues: { 0: 0 },
        detail: {
          chordName: "C",
        },
      });
      expect(actual[8].chord!).toMatchObject({
        appliedKey: "A",
        keys: { 0: "A0" },
        keyValues: { 0: 9 },
        detail: {
          chordName: "A",
        },
      });

      const actual2 = parseChordProgression(
        "Key=C BPM=172 Key=F# I",
        "C",
        4,
        0,
      );
      expect(actual2[6].chord).toMatchObject({
        appliedKey: "F#",
        keys: { 0: "F#0" },
        keyValues: { 0: 6 },
        detail: {
          chordName: "F#",
        },
      });
    });
  });
});
