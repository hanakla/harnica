import { ApplyKey, NoteFragment } from "./types";

export const KEY_CHNAGE_REGEX = /^[Kk]ey=([A-G][#b]?[Mm]?)/;

const TONE_REGEX = /^([A-G][#b]?)?$/;

export function parseKeyChange(
  str: string,
): NoteFragment.KeyChangeNote["keyChange"] | null {
  const match = KEY_CHNAGE_REGEX.exec(str);
  if (!match) return null;

  return parseApplyKeyString(match[1]);
}

export function parseApplyKeyString(str: string): ApplyKey | null {
  const match = TONE_REGEX.exec(str);
  if (!match) return null;

  const [_, tone, quality] = match;
  const isMajor = quality === "M" || quality == null;

  return {
    key: tone,
    major: isMajor,
    minor: !isMajor,
  };
}
