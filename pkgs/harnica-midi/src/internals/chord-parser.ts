// import {
//   NOTE_TO_KEYVALUE_MAP,
//   DEGREE_TO_KEYVALUE_MAP,
//   DEFAULT_OCTAVE,
// } from "./constants";
// import {
//   BeatClock,
//   NoteMatch,
//   NoteMatchFragment,
//   NoteParseResult,
//   NoteQuality,
// } from "./types";
// import {
//   calcBaseKeysFromQualities,
//   getKeyValueByKeyString,
//   resolveDegreeKeyValue,
// } from "./calc-keys";
// import {
//   getKeyNameByKeyValue,
//   getKeyNamesByKeyValues,
//   getNoteStringFromNoteValue,
//   getDegreeStringFromKeyValue,
//   stringifyNoteQualities,
// } from "./chord-assembler";
// import { normalizeKeyValue } from "./math";

// const KEY_CHNAGE_REGEX = /^[Kk]ey=([A-G][#b]?[Mm]?)$/;
// const SIGBODY_REGEX = new RegExp("((?:(?:[A-G]|[IV]+?)[b#],?)+)");
// const SIG_CHANGE_REGEX = new RegExp(`^[Ss]ig=${SIGBODY_REGEX.source}$`);

// // Syntax abstract:
// // [+-]([A-G][#b-])(maj|[Mm-])(....)(/[A-G])?(omit[35])?
// // ^-- Octave sign  ^-- Maj/min     ^-- Slash
// //        ^-- Note name　　　　　^-- Qualities　　^-- Omit
// const ENG_NOTE_REGEX = /^([+-]?)([A-G][#b-]?)([^/]*?)(?:\/([A-G][#b]?))?$/;
// const DEGREE_NOTE_REGEX = /^([+-]?)([IV]+[#b-]?)([^/]*?)(?:\/([IV]+[#b]?))?$/;
// // const DURATION_REGEX = /\[(2|4|8|16|32|dot|triplet)\]/;

// export function parseNoteQuality(qualityStr: string) {
//   const qualities: NoteQuality[] = [];

//   const tonicPattern = /^(maj|[Mm]|-)/;
//   const tensionPattern =
//     /(sus[24])|(omit[35])|(dim|aug|add)\d?|([-b#+]?M?(?:[5679]|69|11|13))/g;

//   const tonicMatch = qualityStr.match(tonicPattern);
//   if (tonicMatch) {
//     // prettier-ignore
//     const normalized = (
//       tonicMatch[0] == "maj" ? "M"
//       : tonicMatch[0] == "-" ? "m"
//       : tonicMatch[0]
//     ) as 'M' | 'm';

//     qualities.push(["quality", normalized]);
//     qualityStr = qualityStr.slice(tonicMatch[0].length);
//   }

//   let tensionMatch: RegExpExecArray | null;
//   while ((tensionMatch = tensionPattern.exec(qualityStr)) !== null) {
//     const allMatch = tensionMatch[0];
//     const sus = tensionMatch[1];
//     const omit = tensionMatch[2];

//     if (sus) {
//       qualities.push(["sus", sus.slice(3)]);
//     } else if (omit != null) {
//       qualities.push(["omit", omit.slice(4)]);
//     } else if (allMatch.startsWith("dim")) {
//       qualities.push(["dim", allMatch.slice(3)]);
//     } else if (allMatch.startsWith("aug")) {
//       qualities.push(["aug", allMatch.slice(3)]);
//     } else {
//       qualities.push(["tension", allMatch.replace(/^\+/g, "")]);
//     }
//   }

//   return qualities;
// }

// function parseSignature(
//   str: string,
// ): NoteParseResult.SignatureChange["sigs"] | null {
//   const match = SIGBODY_REGEX.exec(str);
//   if (!match) return null;

//   return match[1]
//     .split(",")
//     .map((s) => {
//       const alphaMatch = /^([A-G])([#b])/.exec(s);
//       if (alphaMatch) {
//         return {
//           isDegree: false,
//           targetKey: NOTE_TO_KEYVALUE_MAP[alphaMatch[1]],
//           offset: alphaMatch[2] === "#" ? 1 : -1,
//         };
//       }

//       const degreeMatch = /^([IV]+)([b#])/.exec(s);
//       if (degreeMatch) {
//         return {
//           isDegree: true,
//           targetKey: DEGREE_TO_KEYVALUE_MAP[degreeMatch[1]],
//           offset: degreeMatch[2] === "#" ? 1 : -1,
//         };
//       }
//     })
//     .filter((v): v is Exclude<typeof v, null | undefined> => v != null);
// }

// function parseAlphabetNotation(chord: string): NoteMatchFragment | null {
//   const match = ENG_NOTE_REGEX.exec(chord);

//   if (!match) {
//     return null;
//   }

//   const octaveSign = match[1];
//   const root = match[2];
//   const qualities = parseNoteQuality(match[3]);
//   const slash = match[4];
//   const omit = match[5];

//   return {
//     root: getKeyValueByKeyString(root),
//     qualities,
//     slash: slash ? getKeyValueByKeyString(slash) : undefined,
//     omitted: omit ? [normalizeKeyValue(parseInt(omit, 10))] : undefined,
//     octave: { "-": -1, "": 0, "+": 1 }[octaveSign]! as -1 | 0 | 1,
//     isDegree: false,
//     resolveKey: null,
//     match: {
//       start: match.index,
//       length: match[0].length,
//       string: match[0],
//     },
//     warns: [],
//   };
// }

// function parseDegreeName(
//   chord: string,
//   keyKey?: KeyString,
// ): KeyParseResult | null {
//   const match = DEGREE_NOTE_REGEX.exec(chord);

//   if (!match) {
//     return null;
//   }

//   const octaveSign = match[1];
//   const degreeRoot = match[2];
//   const qualities = parseNoteQuality(match[3]);
//   const slash = match[4];
//   const omit = match[5];

//   const keyKeyValue = keyKey ? getKeyValueByKeyString(keyKey) : 0;
//   const scaleDegree = DEGREE_TO_KEYVALUE_MAP[degreeRoot];
//   const slashValue = slash ? DEGREE_TO_KEYVALUE_MAP[slash] : undefined;

//   if (scaleDegree == null) return null;
//   if (slash != null && slashValue == null) return null;

//   const root = (scaleDegree + keyKeyValue) % 12;

//   return {
//     root,
//     qualities,
//     slash: slashValue ? slashValue + keyKeyValue : undefined,
//     omitted: omit ? [parseInt(omit, 10)] : undefined,
//     octave: { "-": -1, "": 0, "+": 1 }[octaveSign]! as -1 | 0 | 1,
//     isDegree: true,
//     resolveKey: keyKey ?? null,
//     match: {
//       start: match.index,
//       length: match[0].length,
//       string: match[0],
//     },
//     warns: [
//       degreeRoot === "Ib" ? "Ib is correctly VII" : null,
//       degreeRoot === "IVb" ? "IVb is correctly III" : null,
//       degreeRoot === "III#" ? "III# is correctly IV" : null,
//       degreeRoot === "VII#" ? "VII# is correctly I" : null,
//     ].filter((v): v is Exclude<typeof v, null> => !!v),
//   };
// }

// export function parseSingleNote(
// note: string,
//   keyKey?: KeyString,
//   baseOctave: number = DEFAULT_OCTAVE,
//   opts: ParseOption = {},
// ): NoteParseResult {
//   const normalizedNote = note.trim();

//   const degreeMatch = parseDegreeName(normalizedNote, keyKey);
//   const englishMatch = parseAlphabetNotation(normalizedNote);
//   const keyChangeMatch = KEY_CHNAGE_REGEX.exec(normalizedNote);
//   const sigChangeMatch = SIG_CHANGE_REGEX.exec(normalizedNote);
//   const matchResult: KeyParseResult | null = degreeMatch ?? englishMatch;

//   const spaceMatch = /^\*$/g.exec(note);
//   if (spaceMatch) {
//     return {
//       type: "voidSpace",
//       spaceMatch: true,
//       match: { start: 0, length: spaceMatch[0].length, string: spaceMatch[0] },
//     };
//   }

//   const repeatMatch = /[_%]/.exec(normalizedNote);
//   if (repeatMatch) {
//     return {
//       type: "repeat",
//       match: {
//         start: repeatMatch.index,
//         length: repeatMatch[0].length,
//         string: repeatMatch[0],
//       },
//     };
//   } else if (normalizedNote === "#") {
//     const match = /#/.exec(normalizedNote)!;

//     return {
//       type: "rest",
//       match: { start: match.index, length: match[0].length, string: match[0] },
//     };
//   } else if (normalizedNote === "[") {
//     const match = /\[/.exec(note)!;

//     return {
//       type: "braceBegin",
//       match: { start: match.index, length: match[0].length, string: match[0] },
//     };
//   } else if (normalizedNote === "]") {
//     const match = /\]/.exec(note)!;

//     return {
//       type: "braceEnd",
//       match: { start: match.index, length: match[0].length, string: match[0] },
//     };
//   }

//   if (keyChangeMatch) {
//     return {
//       type: "keyChange",
//       key: keyChangeMatch[1],
//       match: {
//         start: keyChangeMatch.index!,
//         length: keyChangeMatch[0].length,
//         string: keyChangeMatch[0],
//       },
//     };
//   }

//   if (sigChangeMatch) {
//     const sigs = parseSignature(sigChangeMatch[1]);

//     if (!sigs) {
//       return {
//         type: "error",
//         error: new Error(`Invalid signature: ${JSON.stringify(note)}`),
//         match: {
//           start: 0,
//           length: note.length,
//           string: note,
//         },
//       };
//     }

//     return {
//       type: "signatureChange",
//       sigs,
//       match: {
//         start: sigChangeMatch.index!,
//         length: sigChangeMatch[0].length,
//         string: sigChangeMatch[0],
//       },
//     };
//   }

//   if (!matchResult) {
//     return {
//       type: "extraChars",
//       match: {
//         start: 0,
//         length: note.length,
//         string: note,
//       },
//     };

//     return {
//       type: "error",
//       error: new Error(`Invalid chord notation: ${JSON.stringify(note)}`),
//       match: {
//         start: 0,
//         length: note.length,
//         string: note,
//       },
//     };
//   }

//   const { root, qualities, slash, omitted, octave, match } = matchResult;
//   let keys = calcBaseKeysFromQualities(qualities, opts);
//   // Apply root and octave
//   keys = keys.map((key) => key + root + 12 * octave);

//   if (slash != null) {
//     keys.unshift(slash - 12);
//   }

//   keys.sort((a, b) => a - b);

//   const hasMajororMinor = qualities.find(
//     ([type, q]) => type === "quality" && (q === "m" || q === "M"),
//   );
//   const hasMmAndSus = hasMajororMinor && qualities.find(([q]) => q === "sus");
//   const hasMmAndAug = hasMajororMinor && qualities.find(([q]) => q === "aug");

//   const qualityNames = stringifyNoteQualities(qualities);
//   const alphabetRootName = getKeyNameByKeyValue(root);
//   const alphabetSlashName = slash ? "/" + getKeyNameByKeyValue(slash) : "";
//   const alphabetOmitName = omitted
//     ? "omit" + getKeyNameByKeyValue(omitted[0])
//     : "";

//   const degreeRootName = getDegreeStringFromKeyValue(root);
//   const degreeSlashName = slash ? "/" + getDegreeStringFromKeyValue(slash) : "";
//   const degreeOmitName = omitted
//     ? "omit" + getDegreeStringFromKeyValue(omitted[0])
//     : "";

//   return {
//     type: "note",
//     keys: keys.map((val) => getKeyNameByKeyValue(val, baseOctave)),
//     keyValues: keys,
//     octave,
//     isDegree: matchResult.isDegree,
//     resolveKey: matchResult.resolveKey,
//     detail: {
//       root: getKeyNameByKeyValue(root),
//       degreeRoot: getDegreeStringFromKeyValue(root),
//       originalChordName: normalizedNote,
//       // originalChordName: matchResult.isDegree
//       //   ? `${degreeRootName}${qualityNames}${degreeSlashName}${degreeOmitName}`
//       //   : `${alphabetRootName}${qualityNames}${alphabetSlashName}${alphabetOmitName}`,
//       chordName: `${alphabetRootName}${qualityNames}${alphabetSlashName}${alphabetOmitName}`,
//       qualities,
//       warns: [
//         hasMmAndSus
//           ? {
//               type: "susWithMajorMinor",
//               message:
//                 "Major / minor and sus chords maybe invalid chord notation",
//             }
//           : null,
//         hasMmAndAug
//           ? {
//               type: "augWithMajorMinor",
//               message:
//                 "Major / minor and aug chords maybe invalid chord notation",
//             }
//           : null,
//         ...matchResult.warns.map((message) => ({
//           type: "aliasedDegree",
//           message,
//         })),
//       ].filter((v): v is Exclude<typeof v, null> => !!v),
//     },
//     match: {
//       start: match.start,
//       length: match.length,
//       string: match.string,
//     },
//   };
// }
