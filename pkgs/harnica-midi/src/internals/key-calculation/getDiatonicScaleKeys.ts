import { parseApplyKeyString } from "../parser/parseKeyChange";
import { ApplyKey } from "../parser/types";
import { getKeyValueByKeyName } from "./getKeyValueBy";

type ScaleKeyEntry = {
  rootChordName: string;
  rootKeyValue: number;
  keysValues: number[];
};

type Keys = "i" | "ii" | "iii" | "iv" | "v" | "vi" | "vii";

export function getDiatonicScale(
  key: string | ApplyKey,
): Record<Keys, ScaleKeyEntry> | null {
  const applyKey = typeof key === "string" ? parseApplyKeyString(key) : key;
  if (applyKey == null) return null;

  const keyKeyValue = getKeyValueByKeyName(applyKey.key);
  if (keyKeyValue == null) return null;

  return null;
}

if (import.meta.vitest) {
  describe("getDiatonicScale", () => {
    it.skip("a", () => {});
  });
}
