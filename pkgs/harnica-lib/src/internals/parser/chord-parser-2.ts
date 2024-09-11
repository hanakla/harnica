import { DEFAULT_BEATS, DEFAULT_OCTAVE } from "../constants";
import { BeatClock, KeyString, assertKeyString } from "../types";
import { NoteFragment, NoteFragmentType, NoteMatch } from "./types";
import { KEY_CHNAGE_REGEX, parseKeyChange } from "./parseKeyChange";
import { ALPHA_NOTE_REGEX, parseAlphabetName } from "./parseAlphaName";
import { DEGREE_NOTE_REGEX, parseDegreeName } from "./parseDegreeName";
import { BPM_CHANGE_REGEX, parseBPMChange } from "./parseBPM";
import {
  addBeatClock,
  normalizeBeatClock,
  subtractBeatClock,
} from "../beatclock";

const COMMENT_REGEX = /^[#].*?[#]$/;

// Syntax abstract:
// [+-]([A-G][#b-])(maj|[Mm-])(....)(/[A-G])?(omit[35])?
// ^-- Octave sign  ^-- Maj/min     ^-- Slash
//        ^-- Note name　　　　　^-- Qualities　　^-- Omit
// const NOTE_REGEX = /^([+-]?)([A-G][#b-]?)([^/]*?)(?:\/([A-G][#b]?))?$/;
// const DEGREE_NOTE_REGEX = /^([+-]?)([IV]+[#b-]?)([^/]*?)(?:\/([IV]+[#b]?))?$/;
// const DURATION_REGEX = /\[(2|4|8|16|32|dot|triplet)\]/;

export function parseChordProgression(
  progression: string,
  key: string = "C",
  sigBeats: number = DEFAULT_BEATS,
  baseOctave: number = DEFAULT_OCTAVE,
) {
  let ateStrCount: number = 0;
  let fragments: NoteFragmentType[] = [];
  let currentKey = key;
  let fragIndex = 0;
  let noteIndex = 0;

  assertKeyString(currentKey);

  while (progression.length !== 0) {
    let match: RegExpExecArray | null;

    if ((match = KEY_CHNAGE_REGEX.exec(progression))) {
      const key = match[1];
      currentKey = key;

      assertKeyString(currentKey);

      const keyChange = parseKeyChange(match[0]);

      if (!keyChange) {
        fragments.push(
          createError(
            `Invalid key change: ${JSON.stringify(match)}`,
            fragIndex++,
            match,
            ateStrCount,
          ),
        );
        ateStrCount += match[0].length;
        progression = progression.slice(match?.[0].length ?? 1);
        continue;
      }

      fragments.push({
        type: "keyChange",
        isSoundable: false,
        fragIndex: fragIndex++,
        keyChange: keyChange,
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = BPM_CHANGE_REGEX.exec(progression))) {
      const bpmChange = parseBPMChange(match[0]);

      if (!bpmChange) {
        fragments.push(
          createError(
            `Invalid BPM change: ${JSON.stringify(match)}`,
            fragIndex++,
            match,
            ateStrCount,
          ),
        );
        ateStrCount += match[0].length;
        progression = progression.slice(match?.[0].length ?? 1);
        continue;
      }

      fragments.push({
        type: "bpmChange",
        isSoundable: false,
        fragIndex: fragIndex++,
        bpmChange: bpmChange,
        time: null as any, // set later
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = ALPHA_NOTE_REGEX.exec(progression))) {
      const chord = parseAlphabetName(match[0], currentKey, baseOctave);

      if (!chord) {
        fragments.push(
          createError(
            `Invalid chord: ${JSON.stringify(match)}`,
            fragIndex++,
            match,
            ateStrCount,
          ),
        );
        ateStrCount += match[0].length;
        progression = progression.slice(match?.[0].length ?? 1);
        continue;
      }

      fragments.push({
        type: "chord",
        isSoundable: true,
        noteIndex: noteIndex++,
        fragIndex: fragIndex++,
        chord,
        match: createMatch(match, ateStrCount),
        time: null as any, // set later
      });
    } else if ((match = DEGREE_NOTE_REGEX.exec(progression))) {
      const chord = parseDegreeName(match[0], currentKey, baseOctave);

      if (!chord) {
        fragments.push(
          createError(
            `Invalid chord: ${JSON.stringify(match)}`,
            fragIndex++,
            match,
            ateStrCount,
          ),
        );
        ateStrCount += match[0].length;
        progression = progression.slice(match?.[0].length ?? 1);
        continue;
      }

      fragments.push({
        type: "chord",
        isSoundable: true,
        fragIndex: fragIndex++,
        noteIndex: noteIndex++,
        chord,
        match: createMatch(match, ateStrCount),
        time: null as any, // set later
      });
    } else if ((match = /^\(/.exec(progression))) {
      fragments.push({
        type: "braceBegin",
        isSoundable: false,
        fragIndex: fragIndex++,
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = /^\)/.exec(progression))) {
      fragments.push({
        type: "braceEnd",
        isSoundable: false,
        fragIndex: fragIndex++,
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = /^(\||\n)+/.exec(progression))) {
      fragments.push({
        type: "barSeparator",
        isSoundable: false,
        fragIndex: fragIndex++,
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = COMMENT_REGEX.exec(progression))) {
    } else if ((match = /^#/.exec(progression))) {
      // find next # or \n
      const commentMatch = /#.*?(#|\n)/.exec(progression);
      if (!commentMatch) {
        fragments.push(
          createError(
            `Invalid comment: ${JSON.stringify(match)}`,
            fragIndex++,
            match,
            ateStrCount,
          ),
        );
        ateStrCount += match[0].length;
        progression = progression.slice(match?.[0].length ?? 1);
        continue;
      }

      match = commentMatch;

      fragments.push({
        type: "comment",
        isSoundable: false,
        fragIndex: fragIndex++,
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = /^[_]/.exec(progression))) {
      fragments.push({
        type: "repeat",
        isSoundable: true,
        noteIndex: noteIndex++,
        fragIndex: fragIndex++,
        repeat: {},
        match: createMatch(match, ateStrCount),
        time: null as any, // set later
      });
    } else if ((match = /^[%]/.exec(progression))) {
      fragments.push({
        type: "rest",
        isSoundable: true,
        noteIndex: noteIndex++,
        fragIndex: fragIndex++,
        rest: { duration: null },
        match: createMatch(match, ateStrCount),
        time: null as any, // set later
      });
    } else if ((match = /^[\s　]/.exec(progression))) {
      fragments.push({
        type: "characters",
        isSoundable: false,
        fragIndex: fragIndex++,
        match: createMatch(match, ateStrCount),
      });
    } else if ((match = /^.*?(?:\n|$)/.exec(progression))) {
      fragments.push({
        type: "characters",
        isSoundable: false,
        fragIndex: fragIndex++,
        match: createMatch(match, ateStrCount),
      });
    }

    ateStrCount += match?.[0].length ?? 0;
    progression = progression.slice(match?.[0].length ?? 1);
  }

  attachTimeToNotes(fragments, sigBeats);

  return fragments;

  function createError(
    message: string,
    index: number,
    match: RegExpExecArray,
    ate: number,
  ) {
    return {
      type: "error",
      fragIndex: index,
      isSoundable: false,
      error: new Error(message),
      match: createMatch(match, ate),
    } as NoteFragment.ErroredNote;
  }

  function createMatch(match: RegExpExecArray, ate: number): NoteMatch {
    return {
      start: ate + match.index,
      end: ate + match.index + match[0].length,
      length: match[0].length,
      string: match[0],
    };
  }
}

export function attachTimeToNotes(
  fragments: NoteFragmentType[],
  sigBeats: number,
) {
  let currentTime: BeatClock = [0, 0, 0];
  let currentBarNotes: Array<
    NoteFragment.TimedNote | NoteFragment.TimedNote[]
  > = [];
  // let currentBarNotesCount = 0;
  let currentGroupNotes: NoteFragment.TimedNote[] | null = null;

  const setTimesToCurrentBarNotes = () => {
    let barRemainingBeats: BeatClock = [1, 0, 0];

    if (currentGroupNotes) {
      currentBarNotes.push(currentGroupNotes);
      currentGroupNotes = null;
    }

    const barSoundableNotes = countSoundableNotesShallowly(currentBarNotes);

    if (currentBarNotes.length === 0) return;

    currentBarNotes.forEach((note) => {
      const perNoteDur = getPerNoteInBarBeatClockDuration(
        barSoundableNotes,
        sigBeats,
      );

      const perNoteTickDur = `T${Math.round((128 * sigBeats) / barSoundableNotes)}`;

      if (Array.isArray(note)) {
        const perNoteDurInGroup = getPerNoteInGroupBeatBlockDurationInGroup(
          barSoundableNotes,
          note.length,
          sigBeats,
        );

        const perNoteTickDurInGroup = `T${Math.round(
          (128 * sigBeats) / barSoundableNotes / note.length,
        )}`;

        note.forEach((n) => {
          n.time = {
            duration: {
              beatClock: [...perNoteDurInGroup],
              beatClockStr: perNoteDurInGroup.join(":"),
              tick: perNoteTickDurInGroup,
            },
            startAt: {
              beatClock: [...currentTime],
              beatClockStr: currentTime.join(":"),
            },
          };

          currentTime = addBeatClock(currentTime, perNoteDurInGroup, sigBeats);
          barRemainingBeats = subtractBeatClock(
            barRemainingBeats,
            perNoteDurInGroup,
            sigBeats,
          );
        });
      } else {
        note.time = {
          duration: {
            beatClock: perNoteDur,
            beatClockStr: perNoteDur.join(":"),
            tick: perNoteTickDur,
          },
          startAt: {
            beatClock: [...currentTime],
            beatClockStr: currentTime.join(":"),
          },
        };

        currentTime = addBeatClock(currentTime, perNoteDur, sigBeats);
        barRemainingBeats = subtractBeatClock(
          barRemainingBeats,
          perNoteDur,
          sigBeats,
        );
      }
    });

    // Seek to head of next bar
    currentTime = addBeatClock(currentTime, barRemainingBeats, sigBeats);
  };

  for (const note of fragments) {
    if (note.type === "barSeparator") {
      setTimesToCurrentBarNotes();

      currentBarNotes = [];
      currentGroupNotes = null;
    } else if (note.type === "chord") {
      if (currentGroupNotes) {
        currentGroupNotes.push(note);
      } else {
        currentBarNotes.push(note);
      }
    } else if (note.type === "repeat") {
      if (currentGroupNotes) {
        currentGroupNotes.push(note);
      } else {
        currentBarNotes.push(note);
      }
    } else if (note.type === "rest") {
      if (currentGroupNotes) {
        currentGroupNotes.push(note);
      } else {
        currentBarNotes.push(note);
      }
    } else if (note.type === "bpmChange") {
      if (currentGroupNotes) {
        currentGroupNotes.push(note);
      } else {
        currentBarNotes.push(note);
      }
    } else if (note.type === "braceBegin") {
      // if (currentGroupNotes) {
      //   currentBarNotes.push(currentGroupNotes);
      // }

      currentGroupNotes = [];
    } else if (note.type === "braceEnd") {
      if (currentGroupNotes) {
        currentBarNotes.push(currentGroupNotes);
      }

      currentGroupNotes = null;
    }
  }

  setTimesToCurrentBarNotes();

  function getPerNoteInBarBeatClockDuration(
    numChordsInBars: number,
    sigBeats: number,
  ): BeatClock {
    if (numChordsInBars === 0) return [0, 0, 0];
    if (numChordsInBars === 1) return [1, 0, 0];

    // two chords in a bar
    if (sigBeats / numChordsInBars >= 2) {
      return [0, 2, 0];
    }
    // 3~4 chords in a bar
    else if (sigBeats / numChordsInBars >= 1) {
      return normalizeBeatClock([0, 1, 0], sigBeats);
    }
    // 5~8 chords in a bar
    else if (sigBeats / numChordsInBars >= 1) {
      return normalizeBeatClock([0, 0.5, 0], sigBeats);
    }
    // 9~16 chords in a bar
    else if (sigBeats / numChordsInBars >= 0.5) {
      return normalizeBeatClock([0, 0.25, 0], sigBeats);
    }

    return [1, 0, 0];
  }

  function getPerNoteInGroupBeatBlockDurationInGroup(
    numNotesInBars: number,
    numNotesInGroup: number,
    sigBeats: number,
  ): BeatClock {
    const oneNoteDuration = getPerNoteInBarBeatClockDuration(
      numNotesInBars,
      sigBeats,
    );

    return normalizeBeatClock(
      [
        oneNoteDuration[0] / numNotesInGroup,
        oneNoteDuration[1] / numNotesInGroup,
        oneNoteDuration[2] / numNotesInGroup,
      ],
      sigBeats,
    );
  }
}

function countSoundableNotesShallowly(
  notes: (NoteFragment.TimedNote | NoteFragment.TimedNote[])[],
) {
  return notes.reduce(
    (acc, note) =>
      acc +
      (Array.isArray(note)
        ? countSoundableNotesShallowly(note) > 0
          ? 1
          : 0
        : note.isSoundable
          ? 1
          : 0),
    0,
  );
}

export function parseStringAsSingleChordNote(
  str: string,
  key: string = "C",
  baseOctave: number = DEFAULT_OCTAVE,
) {
  assertKeyString(key);

  const notes = parseChordProgression(str, key, 4, baseOctave);
  return (notes.find((n) => n.type === "chord") ??
    null) as NoteFragment.ChordNote | null;
}

if (import.meta.vitest) {
  describe("normalizeBeatClock", () => {
    it("should normalize beat clock", () => {
      expect(normalizeBeatClock([1.5, 0, 0], 4)).toEqual([1, 2, 0]);
      expect(normalizeBeatClock([1.5, 2, 0], 4)).toEqual([2, 0, 0]);
    });
  });
}
