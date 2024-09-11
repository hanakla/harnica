/** Normalize value to 0 to 11 range. Possible to normalize negative value */
export function normalizeKeyValue(value: number) {
  return Math.trunc(((value % 12) + 12) % 12);
}

if (import.meta.vitest) {
  describe("normalizeKeyValue", () => {
    it("works", () => {
      expect(normalizeKeyValue(0)).toBe(0);
      expect(normalizeKeyValue(12)).toBe(0);
    });
  });
}
