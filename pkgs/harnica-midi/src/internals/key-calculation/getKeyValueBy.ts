import { rescue } from "@/utils/rescue";
import { ALPHA_TO_KEYVALUE_MAP } from "../constants";
import { DEGREE_TO_KEYVALUE_MAP } from "../constants";
import { Maybe, maybe } from "@/utils/Maybe";

export function getKeyValueBy(key: string): Maybe<number> {
  const alphaResult = rescue(() => getKeyValueByKeyName(key));
  if (alphaResult.ok) return maybe.ok(alphaResult.result);

  const degreeResult = rescue(() => getKeyValueByDegreeKey(key));
  if (degreeResult.ok) return maybe.ok(degreeResult.result);

  return maybe.fail(new Error(`getKeyValueBy: Invalid key string: ${key}`));
}

/**
 * Get key value by single alphabet key name
 * @param key - key name likes 'C', 'C#' (not witin quality)
 */
export function getKeyValueByKeyName(key: string) {
  const match = /^([+-]?)([A-G][#b-]?)$/.exec(key);
  if (!match)
    throw new Error(`getKeyValueByKeyName: Invalid key string: ${key}`);

  const [, accidental, note] = match;

  return (
    ALPHA_TO_KEYVALUE_MAP[note] +
    (accidental === "-" ? -12 : accidental === "+" ? 12 : 0)
  );
}

export function getKeyValueByDegreeKey(degreeKey: string) {
  if (!/^(I|II|III|IV|V|VI|VII)[#b-]?$/.test(degreeKey)) {
    throw new Error(`Invalid degree string: ${degreeKey}`);
  }

  return DEGREE_TO_KEYVALUE_MAP[degreeKey];
}
