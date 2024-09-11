import { parseQuality } from "./parseQuality";

describe("parseQuality", () => {
  it.each(
    // prettier-ignore
    [
      ["M", [["quality", "M"]]],
      ["M7", [["quality", "M"], ["tension", "7"]]],
      ["dim", [["dim", ""]]],
      ["dim4", [["dim", "4"]]],
      ["sus4", [["sus", "4"]]],
      ['M7omit5', [['quality', 'M'], ['tension', '7'], ['omit', '5']]],
      ['b5', [['tune', 'b', '5']]],
      ['+9', [['tension', '+9']]]
    ],
  )('parseQuality("%s")', (str, result) => {
    expect(parseQuality(str)).toMatchObject(result);
  });
});
