import { ALPHA_TO_KEYVALUE_MAP } from "@/internals/constants";
import { normalizeKeyValue } from "@/internals/key-calculation/normalizeKeyValue";

export function getKeyNameByKeyValue(keyValue: number, baseOctave?: number) {
  const normalized = normalizeKeyValue(keyValue);

  let keyName = Object.keys(ALPHA_TO_KEYVALUE_MAP).find(
    (key) => ALPHA_TO_KEYVALUE_MAP[key] === normalized,
  );
  keyName = keyName === "E#" ? "F" : keyName === "B#" ? "C" : keyName;

  if (!keyName) throw new Error(`Invalid key value: ${keyValue}`);

  if (baseOctave == null) return keyName;

  const octave = Math.floor(keyValue / 12);
  return keyName + octave.toString();
}
