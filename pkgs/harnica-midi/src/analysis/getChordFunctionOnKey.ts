import { parseStringAsSingleChordNote } from "@/internals/parser/chord-parser-2";
import { getTDSChordsByKeyName } from "@/suggests/getTDSChordsByKeyName";
import { formatNote } from "@/internals/chord-assembler";
import { getDegreeDetailByChordName } from "@/internals/conversion/getDegreeDetailByChordName";
import { Maybe, maybe } from "@/utils/Maybe";

type MatchLevel = "perfect" | "sameRoot" | false;

export type ChordFunctionMatch = {
  tonic: MatchLevel;
  secondTonic: MatchLevel;
  thirdTonic: MatchLevel;
  dominant: MatchLevel;
  secondDominant: MatchLevel;
  subdominant: MatchLevel;
  secondSubDominant: MatchLevel;
};

/**
 * Obtain the harmonic function of the given chord.
 */
export function getChordFunctionOnKey(
  chord: string,
  key: string,
): Maybe<ChordFunctionMatch> {
  const note = parseStringAsSingleChordNote(chord, key);

  if (!note) {
    return maybe.fail(
      new Error(`getChordFunctionOnKey: Invalid chord (${chord})`),
    );
  }

  const harmonicsResult = getTDSChordsByKeyName(key, { degree: true });
  if (!harmonicsResult.ok) return maybe.fail(harmonicsResult.error);

  const degree = getDegreeDetailByChordName(note.chord, key)!;

  const normalized = getDegreeDetailByChordName(
    formatNote(
      {
        rootName: degree.rootName!,
        rootDegreeName: degree.rootName!,
        qualities: degree.qualities.filter(
          // Exclude qualities that only add resonance
          // but have little effect on the relationship of the chords
          (q) => q[0] !== "tension" && q[0] !== "omit" && q[0] !== "add",
        ),
      },
      { degree: true },
    )!,
    // degree.root is already degreed,
    // Specify 'C' to keep the root of the degreed chord
    "C",
  )!;

  return maybe.ok(
    Object.fromEntries(
      Object.entries(harmonicsResult.data).map(([key, harmony]) => {
        return [
          key,
          // prettier-ignore
          normalized.chordName === harmony.chordName ? "perfect"
          : normalized.rootName === harmony.root ? "sameRoot"
          : false,
        ];
      }, {}),
    ) as Record<keyof typeof harmonicsResult.data, MatchLevel>,
  );
}
