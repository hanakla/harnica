import { KeyString } from "../types";
import { parseDegreeName } from "./parseDegreeName";

describe("parseDegreeName", () => {
  it("parses degree name", () => {
    const result = parseDegreeName("VIm7", "C", 0)!;
    expect(result.detail.originalChordName).toBe("VIm7");
    expect(result.detail.rootKeyValue).toBe(9);
    expect(result.detail.qualities).toEqual([
      ["quality", "m"],
      ["tension", "7"],
    ]);
  });

  it("slash notes", () => {
    const actual1 = parseDegreeName("VI/I", "C" as KeyString, 0)!;
    expect(actual1.detail.slashKeyValue).toBe(0);

    const actual2 = parseDegreeName("VI/-I", "C" as KeyString, 0)!;
    expect(actual2.detail.slashKeyValue).toBe(-12);
  });
});
