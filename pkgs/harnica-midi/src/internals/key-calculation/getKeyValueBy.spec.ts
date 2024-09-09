import { getKeyValueByDegreeKey } from "./getKeyValueBy";

describe(getKeyValueByDegreeKey.name, () => {
  it.each(
    // prettier-ignore
    [
      ["I", 0],
      ['I#', 1],
      ['VII', 11]
    ],
  )("get for %s", (input, actual) => {
    expect(getKeyValueByDegreeKey(input)).toBe(actual);
  });
});
