import { TENSION_NOTE_MAP_KEYS } from "../constants";
import { TENSION_REGEX } from "../key-calculation/getKeyValuesFromQualities";
import { ChordIR, NoteFragment, NoteFragmentType, NoteQuality } from "./types";

// TODO: https://sound.jp/funmusic/wasei/kinsoku.htm
export function lintProgression(prog: NoteFragmentType[]) {
  let prevNote: NoteFragment.ChordNote | null = null;
  const noteErrors: Record<string, NoteLintErrors[]> = {};

  for (const note of prog) {
    if (note.type !== "chord") continue;

    if (prevNote) {
    }

    prevNote = note;
  }

  return Object.entries(noteErrors).map(([idx, errors]) => ({
    fragIndex: idx,
    errors,
  }));
}

export function lintQuality(qualities: NoteQuality[], qualityStr: string) {
  const hasMajorOrMinor = qualities.find(
    ([type, q]) => type === "quality" && (q === "m" || q === "M"),
  );
  const hasDim = qualities.find(([q]) => q === "dim");
  const hasSus = qualities.find(([q]) => q === "sus");
  const hasAug = qualities.find(([q]) => q === "aug");

  const hasMmAndSus = hasMajorOrMinor && hasSus;
  const hasMmAndAug = hasMajorOrMinor && hasAug;
  const hasDimAndSus = hasDim && hasSus;
  const hasDimAndAug = hasDim && hasAug;

  const tensionErrors = qualities
    .filter((q) => q[0] === "tension")
    .map((q) => checkTensionNotation(q[1]))
    .filter((v): v is NoteLintErrors[] => !!v);

  let match: RegExpMatchArray | null = null;

  return [
    (match = qualityStr.match(/m-5|mb5/)) ? confusing(match[0], "dim") : null,
    hasMmAndSus ? conflicted("sus", "Major / minor") : null,
    hasMmAndAug ? conflicted("aug", "Major / minor") : null,
    hasDimAndSus ? conflicted("sus", "dim") : null,
    hasDimAndAug ? conflicted("aug", "dim") : null,
    checkDuplicatedTension(qualities, qualityStr),
    ...tensionErrors.flat(1),
  ].filter((v): v is Exclude<typeof v, null> => !!v);
}

export function lintNote(
  ir: ChordIR,
  context: {
    isDegree: boolean;
    rootKeyName: string;
  },
): NoteLintErrors[] {
  const x = context;
  let errors: NoteLintErrors[] = [];

  const hasSingleMajor = ir.qualities.find(
    (q) => q[0] === "quality" && q[1] === "M",
  );

  if (x.isDegree) {
    errors.push(
      ...[
        x.rootKeyName === "Ib" ? homonymy("Ib", "VII") : null,
        x.rootKeyName === "IVb" ? homonymy("IVb", "III") : null,
        x.rootKeyName === "III#" ? homonymy("III#", "IV") : null,
        x.rootKeyName === "VII#" ? homonymy("VII#", "I") : null,
        hasSingleMajor
          ? confusing(`${x.rootKeyName}M`, `${x.rootKeyName}`)
          : null,
      ].filter((v): v is Exclude<typeof v, null> => !!v),
    );
  } else {
    return [];
  }

  return errors;
}

export function checkTensionNotation(input: string): NoteLintErrors[] {
  const [, sign, key] = TENSION_REGEX.exec(input) ?? [];

  let errors: NoteLintErrors[] = [];

  if (sign === "M" && key !== "7") {
    errors.push({
      type: "invalidTension",
      input,
      message: `${input} is invalid. M is only for 7 (M7)`,
    });
  } else if (!TENSION_NOTE_MAP_KEYS.includes(key)) {
    errors.push({
      type: "nonExistTension",
      input,
      message: `${input} is invalid. ${key} is not exist in chord notation.`,
    });
  }

  return errors;
}

function checkDuplicatedTension(
  qualities: NoteQuality[],
  quality: string,
): NoteLintErrors | null {
  const tensions = qualities.filter(([q]) => q === "tension");
  if (tensions.length <= 1) return null;

  const numric = /(\d+)/;
  const mostTopTension = [...tensions].sort(
    ([, a], [, b]) => +numric.exec(a)![1] - +numric.exec(b)![1],
  )[0];

  const noTopTensions = tensions.filter((q) => q !== mostTopTension);

  return {
    type: "duplicatedTension",
    duplicated: noTopTensions.map(([, t]) => t),
    recommended: mostTopTension[1],
    message: `${quality} has duplicated tensions. ${noTopTensions.map(([q]) => q).join(", ")} are duplicated.`,
  };
}

function conflicted(inputQuality: string, conflictTo: string): NoteLintErrors {
  return {
    type: "conflicted",
    inputQuality,
    conflictTo,
    message: `${inputQuality} and ${conflictTo} chords maybe invalid (conflicted) chord notation`,
  };
}

function confusing(input: string, recommendTo: string): NoteLintErrors {
  return {
    type: "confusingName",
    inputKey: input,
    recommendTo,
    message: `"${input}" is confusing way of reading score. Recommend to "${recommendTo}" instead.`,
  };
}

function homonymy(input: string, sameTo: string): NoteLintErrors {
  return {
    type: "homonymy",
    inputKey: input,
    sameTo,
    message: `${input} is correctly ${sameTo}`,
  };
}

export type NoteLintErrors =
  | {
      type: "homonymy";
      inputKey: string;
      sameTo: string;
      message: string;
    }
  | {
      type: "confusingName";
      inputKey: string;
      recommendTo: string;
      message: string;
    }
  | {
      type: "conflicted";
      inputQuality: string;
      conflictTo: string;
      message: string;
    }
  | { type: "invalidTension"; input: string; message: string }
  | { type: "nonExistTension"; input: string; message: string }
  | {
      type: "duplicatedTension";
      duplicated: string[];
      recommended: string;
      message: string;
    };
