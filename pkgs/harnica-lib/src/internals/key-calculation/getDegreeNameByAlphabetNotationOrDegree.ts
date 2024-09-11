import { getKeyValueByKeyName } from "./getKeyValueBy";
import { getDegreeNameFromKeyValue } from "../conversion/getDegreeNameFromKeyValue";

export function getDegreeNameByAlphabetNotationOrDegree(
  degree: string,
  key: string = "C",
) {
  if (/^(I|II|III|IV|V|VI|VII).*?$/.test(degree)) {
    return degree;
  }

  const degreeKeyValue = getKeyValueByKeyName(degree)!;
  const keyKeyValue = getKeyValueByKeyName(key)!;

  return getDegreeNameFromKeyValue(degreeKeyValue - keyKeyValue);
}

if (import.meta.vitest) {
  describe("getDegreeNameByAlphabetNotationOrDegree", () => {
    it("works?", () => {
      expect(getDegreeNameByAlphabetNotationOrDegree("C")).toBe("I");
      expect(getDegreeNameByAlphabetNotationOrDegree("D")).toBe("II");
      expect(getDegreeNameByAlphabetNotationOrDegree("E")).toBe("III");
      expect(getDegreeNameByAlphabetNotationOrDegree("F")).toBe("IV");
    });
  });
}
