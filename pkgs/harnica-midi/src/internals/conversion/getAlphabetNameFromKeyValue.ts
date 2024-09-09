import { normalizeKeyValue } from "@/internals/key-calculation/normalizeKeyValue";
import { ALPHA_TO_KEYVALUE_MAP } from "../constants";

export function getAlphabetNameFromKeyValue(
  value: number,
  baseOctave?: number,
) {
  const normalized = normalizeKeyValue(value);
  const keyName = Object.keys(ALPHA_TO_KEYVALUE_MAP).find(
    (key) => ALPHA_TO_KEYVALUE_MAP[key] === normalized,
  );

  if (!keyName) throw new Error(`Invalid key value: ${value}`);

  if (baseOctave == null) return keyName;

  const octave = baseOctave + Math.floor(value / 12);
  return keyName + octave.toString();
}
