import { KeyString } from "../types";
import { parseAlphabetName } from "./parseAlphaName";

describe("parseAlphabetName", () => {
  it("parses key name", () => {
    const result = parseAlphabetName("Am7", "C" as KeyString, 0)!;
    expect(result.detail.originalChordName).toBe("Am7");
    expect(result.detail.rootKeyValue).toBe(9);
    expect(result.detail.qualities).toEqual([
      ["quality", "m"],
      ["tension", "7"],
    ]);

    const result2 = parseAlphabetName("Am7", "D" as KeyString, 0)!;
    expect(result2.detail.originalChordName).toBe("Am7");
    expect(result2.detail.rootKeyValue).toBe(9);
    expect(result2.detail.qualities).toEqual([
      ["quality", "m"],
      ["tension", "7"],
    ]);
  });

  it("slash notes", () => {
    const actual1 = parseAlphabetName("A/C", "C" as KeyString, 0)!;
    expect(actual1.detail.slashKeyValue).toBe(0);

    const actual2 = parseAlphabetName("A/-C", "C" as KeyString, 0)!;
    expect(actual2.detail.slashKeyValue).toBe(-12);
  });
});
