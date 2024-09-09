import { describe, expect, it } from "vitest";
import { ManipulationOps, getModifiedChord } from "./manipulation";

describe("manipulation", () => {
  it.each(
    // prettier-ignore
    [
      ['IIIM7', { removeQuality: [['tension', '7']] }, 'III'],
    ] satisfies [string, ManipulationOps, string][],
  )("works with degree notation", (input, ops, expected) => {
    expect(getModifiedChord(input, ops)?.chord.detail.originalChordName).toBe(
      expected,
    );
  });
});
