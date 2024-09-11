import { describe, expect, it } from "vitest";
import { getKeyValueByKeyString } from "./calc-keys";

describe("calc-key", () => {
  describe("getKeyValueByKey", () => {
    it("no accidentals", () => {
      expect(getKeyValueByKeyString("C")).toBe(0);
    });

    it("with accidentals", () => {
      expect(getKeyValueByKeyString("+C")).toBe(12);
      expect(getKeyValueByKeyString("-C")).toBe(-12);
    });
  });
});
