import { BeatClock } from "./types";

export function normalizeBeatClock(
  [bars, beat, sixteenth]: BeatClock,
  sigBeats: number,
): BeatClock {
  let totalSixteenths = bars * sigBeats * 16 + beat * 16 + sixteenth;

  let normalizedBars = Math.floor(totalSixteenths / (sigBeats * 16));
  let remainingSixteenths = totalSixteenths % (sigBeats * 16);

  let normalizedBeat = Math.floor(remainingSixteenths / 16);
  let normalizedSixteenth = Math.floor(remainingSixteenths % 16);

  return [normalizedBars, normalizedBeat, normalizedSixteenth];
}

export function addBeatClock(
  a: BeatClock,
  b: BeatClock,
  sigBeats: number,
): BeatClock {
  return normalizeBeatClock([a[0] + b[0], a[1] + b[1], a[2] + b[2]], sigBeats);
}

export function subtractBeatClock(
  a: BeatClock,
  b: BeatClock,
  sigBeats: number,
): BeatClock {
  return normalizeBeatClock([a[0] - b[0], a[1] - b[1], a[2] - b[2]], sigBeats);
}
