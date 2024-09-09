import { NoteFragment } from "./types";

export const BPM_CHANGE_REGEX = /^BPM=(\d+)/i;

export function parseBPMChange(
  str: string,
): NoteFragment.BPMChangeNote["bpmChange"] | null {
  const match = BPM_CHANGE_REGEX.exec(str);
  if (!match) return null;

  return {
    bpm: parseInt(match[1]),
  };
}
