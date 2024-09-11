import { DEFAULT_KEY, KEYVALUE_TO_DEGREE_MAP } from "../constants";
import { getKeyValueByKeyName } from "../key-calculation/getKeyValueBy";
import { normalizeKeyValue } from "../key-calculation/normalizeKeyValue";

export function getDegreeNameFromKeyValue(
  value: number,
  baseOctave?: number,
  {
    key,
  }: {
    key?: string | null;
  } = {},
) {
  const keyKeyValue = getKeyValueByKeyName(key ?? DEFAULT_KEY);
  value -= keyKeyValue!;

  const normalized = normalizeKeyValue(value);
  const keyName = KEYVALUE_TO_DEGREE_MAP[normalized];

  if (!keyName) throw new Error(`Invalid key value: ${value}`);

  if (baseOctave == null) return keyName;

  const octave = baseOctave + Math.floor(value / 12);
  return keyName + octave.toString();
}
