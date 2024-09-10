import { parseStringAsSingleChordNote } from "@/internals/parser/chord-parser-2";
import { getKeyNameByKeyValue } from "@/internals/assemble/getKeyNameByKeyValue";
import { getChordDetailFromKeyValues } from "@/internals/conversion/getChordDetailFromKeyValues";
import { Maybe, maybe } from "@/utils/Maybe";
import { getDegreeNameFromKeyValue } from "@/internals/conversion/getDegreeNameFromKeyValue";
import { type NoteFragment } from "@/internals/parser/types";
import { ChordSuggest } from "./toDegreeSuggest";

export type FunctionChordResults = {
  tonic: ChordSuggest;
  secondTonic: ChordSuggest;
  thirdTonic: ChordSuggest;
  dominant: ChordSuggest;
  secondDominant: ChordSuggest;
  subdominant: ChordSuggest;
  secondSubDominant: ChordSuggest;
};

/**
 * Obtain the primary triads for a given key.
 * @param keyName Key string (e.g. "C", "C#")
 */
export function getTDSChordsByKeyName(
  keyName: string | NoteFragment.ChordData,
  opt: { degree?: boolean } = {},
): Maybe<FunctionChordResults> {
  const chordData =
    typeof keyName === "string"
      ? parseStringAsSingleChordNote(keyName, "C", 0)?.chord
      : keyName;

  if (!chordData || chordData.detail.qualities.length !== 0)
    return maybe.fail(
      new Error(`getTriadChordsByKey: Invalid key (${keyName})`),
    );

  const baseOctave = chordData.detail.octaveValue;
  const key = chordData.detail.rootName;

  // SEE: https://bass-beginner.com/theory/substitute.html
  const tonic = parseStringAsSingleChordNote("IM", key, baseOctave)!.chord;
  const secondTonic = parseStringAsSingleChordNote(
    "IIIm",
    key,
    baseOctave,
  )!.chord;
  const thirdTonic = parseStringAsSingleChordNote(
    "VIm",
    key,
    baseOctave,
  )!.chord;

  const dominant = parseStringAsSingleChordNote("V", key, baseOctave)!.chord;
  const secondDominant = parseStringAsSingleChordNote(
    "VIIm-5",
    key,
    baseOctave,
  )!.chord;

  const subdominant = parseStringAsSingleChordNote(
    "IV",
    key,
    baseOctave,
  )!.chord;
  const secondSubDominant = parseStringAsSingleChordNote(
    "IIm",
    key,
    baseOctave,
  )!.chord;

  const buildSet = (chord: NoteFragment.ChordData): ChordSuggest => ({
    root: opt.degree
      ? getDegreeNameFromKeyValue(chord.keyValues[0], undefined, { key })
      : getKeyNameByKeyValue(chord.keyValues[0]),
    chordName: getChordDetailFromKeyValues(
      chord.keyValues,
      chord.detail.octaveValue,
      opt,
    ).chordName,
    keys: chord.keyValues.map((value) => getKeyNameByKeyValue(value)),
    keyValues: chord.keyValues,
    relativeOctave: chord[0] > 12 ? 1 : 0,
    resolvedChordName: chord.detail.chordName,
  });

  return maybe.ok({
    tonic: buildSet(tonic),
    secondTonic: buildSet(secondTonic),
    thirdTonic: buildSet(thirdTonic),
    dominant: buildSet(dominant),
    secondDominant: buildSet(secondDominant),
    subdominant: buildSet(subdominant),
    secondSubDominant: buildSet(secondSubDominant),
  });
}
