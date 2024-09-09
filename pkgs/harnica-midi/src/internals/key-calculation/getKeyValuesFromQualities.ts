import { TENSION_NOTE_MAP, TENSION_NOTE_MAP_KEYS } from "../constants";
import { NoteQuality } from "../parser/types";

export const TENSION_REGEX = /((?:[-+b#M]|M|maj)?)(\d+)/;

export function getKeyValuesFromQualities([
  ...qualities
]: readonly NoteQuality[]): number[] {
  let baseKeys: number[] = [];

  const isMinor =
    qualities.find(
      ([type, quality]) => type === "quality" && quality === "m",
    ) != null;
  const isMajor =
    qualities.find(
      ([type, quality]) => type === "quality" && quality === "M",
    ) != null;

  const isDominant = !isMajor && !isMinor;

  const majorThirdKey: number = 4;
  let thirdKey: number = isMinor ? 3 : 4;
  let fifthKey: number = 7;

  baseKeys.push(0, thirdKey, fifthKey);

  // Process suspended chord
  for (const [type, argument] of qualities) {
    if (type === "sus") {
      if (argument === "2") {
        baseKeys = findReplace(baseKeys, thirdKey, majorThirdKey - 2);
        thirdKey = majorThirdKey - 2;
      } else if (argument === "4") {
        baseKeys = findReplace(baseKeys, thirdKey, thirdKey + 1);
        thirdKey = majorThirdKey + 1;
      }
    } else if (type === "dim") {
      baseKeys = [0, 3, 6]; // Root, minor third, diminished fifth
      if (argument === "7") baseKeys.push(9);

      thirdKey = 3;
      fifthKey = 6;
    }

    // Process omit chord
    for (const q of qualities) {
      if (q[0] === "omit") {
        const [, argument] = q;

        if (argument === "3") {
          baseKeys = findReplace(baseKeys, thirdKey, undefined);
        } else if (argument === "5") {
          baseKeys = findReplace(baseKeys, fifthKey, undefined);
        }
      } else if (q[0] === "tune") {
        const [, tune, key] = q;

        if (key === "5") {
          baseKeys = findReplace(
            baseKeys,
            fifthKey,
            fifthKey + (tune === "#" ? 1 : -1),
          );
        }
      }
    }
  }

  for (const [type, argument] of qualities) {
    switch (type) {
      case "quality":
        break;

      case "tension": {
        const [, sign, key] = TENSION_REGEX.exec(argument) ?? [];
        // const vias =
        //   { b: -1, "#": 1 }[
        //     (
        //       sign.replace(/[-b]/, "b").replace(/[+#M]/, "#") ?? ""
        //     ).toLowerCase()
        //   ] ?? 0;

        // if (sign === "-") {
        //   if (!TENSION_NOTE_MAP_KEYS.includes(key)) break;

        //   baseKeys = baseKeys.filter((v) => v !== TENSION_NOTE_MAP[key] + vias);
        //   baseKeys.push(TENSION_NOTE_MAP[key] + vias - 1);
        // } else {
        if (key == "69") {
          baseKeys.push(TENSION_NOTE_MAP["6"], TENSION_NOTE_MAP["9"]);
          break;
        }

        if (!["5", "6", "7", "9", "11", "13"].includes(key)) {
          console.warn(`Unknown tension: ${argument}`, qualities);
          break;
        }

        if (TENSION_NOTE_MAP[key] == null) break;

        if (key === "5" || key === "6") {
          baseKeys.push(TENSION_NOTE_MAP[key]);
        } else if (key === "7") {
          baseKeys.push(TENSION_NOTE_MAP["7"] + (isMajor ? 0 : -1));
          break;
        } else {
          // if over the 7th, add tension notes from 7th to the key
          const addNotesStartIdx = TENSION_NOTE_MAP_KEYS.indexOf("7");
          const addNotesEndIdx = TENSION_NOTE_MAP_KEYS.indexOf(key);
          if (addNotesStartIdx === -1 || addNotesEndIdx === -1) break;

          TENSION_NOTE_MAP_KEYS.slice(
            addNotesStartIdx,
            addNotesEndIdx + 1,
          ).forEach((key) => {
            const isSeventhKey =
              TENSION_NOTE_MAP[key] === TENSION_NOTE_MAP["7"];

            baseKeys.push(
              isSeventhKey
                ? TENSION_NOTE_MAP[key] + (isMajor ? 0 : -1)
                : TENSION_NOTE_MAP[key],
            );
          });
        }

        break;
      }

      case "dim":
        break;

      case "aug": {
        baseKeys = [];
        baseKeys.push(0, 4, 8); // Root, major third, augmented fifth

        if (argument === "7") {
          if (isMajor) baseKeys.push(11);
          // TODO: minor chord ignored
          else if (isDominant) baseKeys.push(10);
        }

        break;
      }

      case "add": {
        const [, sign, key] = /([#b])?(\d+)/.exec(argument) ?? [];
        const vias = { b: -1, "#": 1, "": 0 }[sign ?? ""] ?? 0;

        if (!TENSION_NOTE_MAP_KEYS.includes(key)) break;
        const addNote = TENSION_NOTE_MAP[key];
        baseKeys.push(addNote + vias);
        break;
      }
    }
  }

  return [...new Set(baseKeys)].sort((a, b) => a - b);
}

function findReplace<T extends any[]>(
  [...arr]: T,
  element: T[number],
  value: T[number] | undefined,
) {
  const index = arr.indexOf(element);
  if (index === -1) return arr;

  if (value === undefined) {
    arr.splice(index, 1);
    return arr;
  }

  arr[index] = value;
  return arr;
}
