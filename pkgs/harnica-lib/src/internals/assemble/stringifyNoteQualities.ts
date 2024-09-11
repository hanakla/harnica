import { NoteQuality } from "../parser/types";

export function stringifyNoteQualities([...qualities]: NoteQuality[]) {
  const majminQualities: string[] = [];
  const tuneQualities: NoteQuality[] = [];
  const susQualities: NoteQuality[] = [];
  const otherQualities: NoteQuality[] = [];
  const tensionQualities: NoteQuality[] = [];

  for (const noteQuality of qualities) {
    if (noteQuality[0] === "sus") {
      susQualities.push(noteQuality);
    } else if (noteQuality[0] === "tension") {
      tensionQualities.push(noteQuality);
    } else if (noteQuality[0] === "quality") {
      majminQualities.push(...noteQuality.slice(1));
    } else if (noteQuality[0] === "tune") {
      tuneQualities.push(noteQuality);
    } else {
      otherQualities.push(noteQuality);
    }
  }

  const format = (qs: NoteQuality[]) => {
    return qs.flat().join("");
  };

  const formatedTensions = tensionQualities
    .map((quality, idx) =>
      tensionQualities.length > 1 && idx !== 0 ? `(${quality[1]})` : quality[1],
    )
    .join("");

  const formattedTunes = tuneQualities
    .map((quality) => `${{ "#": "+", b: "-" }[quality[1]]}${quality[2]}`)
    .join("");

  const shouldOutMajMin =
    [...tuneQualities, ...susQualities, ...otherQualities, ...tensionQualities]
      .length !== 0 || majminQualities.findIndex((q) => q === "m") !== -1;

  return (
    (shouldOutMajMin ? majminQualities.join("") : "") +
    formattedTunes +
    formatedTensions +
    format(otherQualities) +
    format(susQualities)
  );
}

if (import.meta.vitest) {
  describe("stringifyNoteQualities", () => {
    it.each(
      // prettier-ignore
      [
        [[["quality", "m"]], "m"],
        [[["quality", "M"]], ""],
        [[["quality", "m"], ["quality", "M"]], "mM"],
        [[["quality", "M"], ["sus", "4"]], "Msus4"],
        [[["sus", "4"], ["tension", "9"]], "9sus4"],
      ] satisfies Array<[NoteQuality[], string]>,
    )("should stringify note qualities", (input, result) => {
      expect(stringifyNoteQualities(input)).toBe(result);
    });
  });
}
