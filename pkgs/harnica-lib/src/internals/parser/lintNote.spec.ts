import { NoteLintErrors, lintNote, lintQuality } from "./lintNote";

describe("lintNote", () => {
  describe(lintQuality.name, () => {
    it("Major on invalid key", () => {
      const errors = lintQuality([["tension", "M8"]], "M8");
      expect(errors).toEqual([
        {
          type: "invalidTension",
          input: "M8",
          message: `M8 is invalid. M is only for 7 (M7)`,
        } satisfies NoteLintErrors,
      ]);
    });

    it("non exists keyed tension", () => {
      const errors = lintQuality([["tension", "8"]], "8");
      expect(errors).toEqual([
        {
          type: "nonExistTension",
          input: "8",
          message: `8 is invalid. 8 is not exist in chord notation.`,
        } satisfies NoteLintErrors,
      ]);
    });
  });
});
