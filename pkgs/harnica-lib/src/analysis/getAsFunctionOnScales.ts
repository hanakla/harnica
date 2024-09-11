import { Maybe, maybe } from "@/utils/Maybe";
import { parseStringAsSingleChordNote } from "..";
import { NOTE_NAMES } from "@/internals/constants";
import {
  ChordFunctionMatch,
  getChordFunctionOnKey,
} from "./getChordFunctionOnKey";

export function getAsFunctionOnScales(
  chord: string,
  key: string,
): Maybe<{
  [keyName: string]: Array<keyof ChordFunctionMatch>;
}> {
  const note = parseStringAsSingleChordNote(chord, key);

  if (!note) {
    return maybe.fail(
      new Error(`getChordFunctionOnKey: Invalid chord (${chord})`),
    );
  }

  const result = Object.fromEntries(
    NOTE_NAMES.map((key) => {
      const funcs = getChordFunctionOnKey(chord, key).data!;
      const matches = Object.entries(funcs)
        .filter(([type, match]) => match !== false)
        .map(([type]) => type);

      return [key, matches];
    }),
  ) as any;

  return maybe.ok(result);
}
