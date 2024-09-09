import { stringifyNoteQualities } from "../assemble/stringifyNoteQualities";
import { getKeyNameByKeyValue } from "../assemble/getKeyNameByKeyValue";
import { getDegreeNameFromKeyValue } from "../conversion/getDegreeNameFromKeyValue";
import { getKeyValueByKeyName } from "../key-calculation/getKeyValueBy";
import { getKeyValuesFromQualities } from "../key-calculation/getKeyValuesFromQualities";
import { ChordIR, NoteFragment } from "./types";

export function chordIRToNoteChord(
  ir: ChordIR,
  toDegreeNote: boolean,
  baseOctave: number,
): NoteFragment.ChordNote["chord"] {
  const { root, qualities, slash, omitted, octave, applyKey } = ir;

  const octaveOffset = baseOctave + octave;
  const octaveKeyValue = octaveOffset * 12;

  const keyKeyValue = applyKey ? getKeyValueByKeyName(applyKey.key) ?? 0 : 0;
  const rootKeyValue = octaveKeyValue + keyKeyValue + root;

  const keyValues = getKeyValuesFromQualities(qualities).map(
    // Apply root and octave
    (keyValue) => rootKeyValue + keyValue,
  );

  if (slash != null) {
    keyValues.unshift(keyKeyValue + slash - 12 + octaveKeyValue);
  }

  const hasMajororMinor = qualities.find(
    ([type, q]) => type === "quality" && (q === "m" || q === "M"),
  );

  const qualityNames = stringifyNoteQualities(qualities);
  const alphabetRootName = getKeyNameByKeyValue(rootKeyValue);
  const alphabetSlashName = slash ? "/" + getKeyNameByKeyValue(slash) : "";
  const alphabetOmitName = omitted
    ? "omit" + getKeyNameByKeyValue(omitted[0])
    : "";

  const originalChordName = toDegreeNote
    ? `${getDegreeNameFromKeyValue(root)}${qualityNames}`
    : `${alphabetRootName}${qualityNames}`;

  return {
    keys: keyValues.map((val) => getKeyNameByKeyValue(val, baseOctave)),
    keyValues: keyValues,
    octave,
    isDegree: toDegreeNote,
    appliedKey: ir.applyKey?.key ?? null,
    detail: {
      octaveValue: octaveOffset,
      appliedKey: ir.applyKey,
      rootName: getKeyNameByKeyValue(rootKeyValue),
      rootKeyValue: rootKeyValue,
      rootDegreeName: getDegreeNameFromKeyValue(rootKeyValue),
      originalChordName,
      chordName: `${alphabetRootName}${qualityNames}${alphabetSlashName}${alphabetOmitName}`,
      qualities,
      slashKeyValue: slash ?? null,
      warns: [
        // hasMmAndSus
        //   ? {
        //       type: "susWithMajorMinor",
        //       message:
        //         "Major / minor and sus chords maybe invalid chord notation",
        //     }
        //   : null,
        // hasMmAndAug
        //   ? {
        //       type: "augWithMajorMinor",
        //       message:
        //         "Major / minor and aug chords maybe invalid chord notation",
        //     }
        //   : null,
        ...ir.warns,
      ].filter((v): v is Exclude<typeof v, null> => !!v),
    },
  };
}
