import { formatNote } from "../internals/chord-assembler";
import { NoteFragment, NoteQuality } from "../internals/parser/types";
import { parseStringAsSingleChordNote } from "../internals/parser/chord-parser-2";
import { getDegreeNameByAlphabetNotationOrDegree } from "@/internals/key-calculation/getDegreeNameByAlphabetNotationOrDegree";

export type ManipulationOps = {
  root?: string;
  octave?: -1 | 0 | 1;
  addQuality?: NoteQuality[];
  removeQuality?: NoteQuality[];
};

export function getModifiedChord(
  chordStr: string,
  mod: ManipulationOps,
): NoteFragment.ChordNote | null {
  const note = parseStringAsSingleChordNote(chordStr);

  if (note?.type !== "chord") return null;

  let { chord } = note;
  let {
    octave,
    detail: { rootName, qualities },
  } = note?.chord;

  rootName = chord.isDegree ? chord.detail.rootDegreeName : rootName;

  if (mod.root != null) rootName = mod.root;
  if (mod.addQuality != null) qualities = [...qualities, ...mod.addQuality];
  if (mod.removeQuality != null) {
    qualities = qualities.filter(
      (q) =>
        !mod.removeQuality!.some(
          ([type, arg]) => q[0] === type && q[1] === arg,
        ),
    );
  }
  if (mod.octave != null) octave += mod.octave;

  const nextNote = parseStringAsSingleChordNote(
    formatNote({
      octave,
      rootName,
      rootDegreeName: getDegreeNameByAlphabetNotationOrDegree(rootName),
      qualities,
    }),
    "C",
  );

  if (nextNote?.type !== "chord") return null;
  return nextNote;
}
