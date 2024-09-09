import { ALPHA_TO_KEYVALUE_MAP } from "../constants";
import { BeatClock } from "../types";
import { NoteLintErrors } from "./lintNote";

export type NoteMatch = {
  start: number;
  end: number;
  length: number;
  string: string;
};

export type NoteQuality =
  | [type: "quality", argument: "M" | "m"]
  | [type: "quality", argument: "M" | "m", argument: "7"]
  | [type: "tune", argument: "b" | "#", key: "5"]
  | [
      type: "omit" | "dim" | "aug" | "sus" | "add" | "tension",
      argument: string,
    ];

export type KeyString = keyof typeof ALPHA_TO_KEYVALUE_MAP;

/** Alpha/Degreeを問わない中間表現 */
export type ChordIR = {
  /** Non key and octave applied key value */
  root: number;
  qualities: Array<NoteQuality>;
  /** Non key and octave applied key value */
  slash: number | null;
  omitted?: number[];
  /* -1, 0, 1 */
  octave: -1 | 0 | 1;
  applyKey: ApplyKey | null;
  originalInput?: string | null;
  warns: NoteLintErrors[];
};

export type ApplyKey = {
  /** Key tone likes `C`, `Cb` or `C#` */
  key: string;
  major: boolean;
  minor: boolean;
};

export namespace NoteFragment {
  export type NoteBase = {
    fragIndex: number;
    match: NoteMatch;
  };

  type NoteDuration = {
    beatClock: BeatClock;
    beatClockStr: string;
    tick: string;
  };

  type NoteStartAt = {
    beatClock: BeatClock;
    beatClockStr: string;
  };

  type NoteTimeData = {
    startAt: NoteStartAt;
    duration: NoteDuration;
  };

  type OptionalDetailProperties = {
    chord?: ChordData;
    repeat?: RepeatData;
    rest?: RestData;
    keyChange?: KeyChangeData;
    error?: Error;
    time?: NoteTimeData;
  };

  export type ChordData = {
    /** should to ordering [slash] / 1st / 3rd / 5th .... */
    keyValues: number[];
    /** keys likes 'C3'. should to ordering [slash] / 1st / 3rd / 5th .... */
    keys: string[];
    octave: -1 | 0 | 1;
    isDegree: boolean;
    appliedKey: string | null;
    detail: {
      octaveValue: number;
      appliedKey: ApplyKey | null;
      /** Alphabet note */
      rootName: string;
      /** 0 is C0 */
      rootKeyValue: number;
      rootDegreeName: string;
      qualities: NoteQuality[];
      /** 0 is C0 */
      slashKeyValue: number | null;
      /** Degree or Alphabet notation chord name */
      originalChordName: string;
      /** Alphabet notation chord name (resolved or not) */
      chordName: string;
      warns: Array<{ type: string; message: string }>;
    };
  };

  type RepeatData = {};

  type RestData = {};

  type KeyChangeData = ApplyKey;

  type BPMChangeData = {
    bpm: number;
  };

  export type ChordNote = NoteBase &
    Omit<OptionalDetailProperties, "chord" | "time"> & {
      type: "chord";
      isSoundable: true;
      noteIndex: number;
      chord: ChordData;
      time: NoteTimeData;
    };

  export type RepeatNote = NoteBase &
    Omit<OptionalDetailProperties, "repeat" | "time"> & {
      type: "repeat";
      isSoundable: true;
      noteIndex: number;
      repeat: RepeatData;
      match: NoteMatch;
      time: NoteTimeData;
    };

  export type RestNote = NoteBase &
    Omit<OptionalDetailProperties, "rest" | "time"> & {
      type: "rest";
      isSoundable: true;
      noteIndex: number;
      rest: RestData;
      match: NoteMatch;
      time: NoteTimeData;
    };

  export type BarSeparator = NoteBase &
    OptionalDetailProperties & {
      type: "barSeparator";
      isSoundable: false;
      noteIndex?: undefined;
    };

  export type KeyChangeNote = NoteBase &
    OptionalDetailProperties & {
      type: "keyChange";
      isSoundable: false;
      noteIndex?: undefined;
      keyChange: KeyChangeData;
    };

  export type BPMChangeNote = NoteBase &
    OptionalDetailProperties & {
      type: "bpmChange";
      isSoundable: false;
      noteIndex?: undefined;
      bpmChange: BPMChangeData;
      time: NoteTimeData;
    };

  // export type SignatureChange = {
  //   type: "signatureChange";
  //   sigs: Array<{
  //     isDegree: boolean;
  //     targetKey: number;
  //     offset: number;
  //   }>;
  //   match: NoteMatch;
  // };

  export type Characters = NoteBase &
    OptionalDetailProperties & {
      type: "characters";
      isSoundable: false;
      noteIndex?: undefined;
    };

  export type ErroredNote = NoteBase &
    OptionalDetailProperties & {
      type: "error";
      isSoundable: false;
      noteIndex?: undefined;
      error: globalThis.Error;
    };

  export type BraceBegin = NoteBase &
    OptionalDetailProperties & {
      type: "braceBegin";
      isSoundable: false;
      noteIndex?: undefined;
    };

  export type BraceEnd = NoteBase &
    OptionalDetailProperties & {
      type: "braceEnd";
      isSoundable: false;
      noteIndex?: undefined;
    };

  export type Comment = NoteBase &
    OptionalDetailProperties & {
      type: "comment";
      isSoundable: false;
      noteIndex?: undefined;
    };

  export type SoundableNote =
    | NoteFragment.ChordNote
    | NoteFragment.RepeatNote
    | NoteFragment.RestNote;

  export type TimedNote =
    | NoteFragment.ChordNote
    | NoteFragment.RepeatNote
    | NoteFragment.RestNote
    | NoteFragment.BPMChangeNote;
}

export type NoteFragmentType =
  | NoteFragment.ChordNote
  | NoteFragment.RepeatNote
  | NoteFragment.RestNote
  | NoteFragment.KeyChangeNote
  | NoteFragment.BPMChangeNote
  // | NoteParseResult.SignatureChange
  | NoteFragment.Characters
  // | NoteParseResult.ExtraChars
  | NoteFragment.BarSeparator
  | NoteFragment.BraceBegin
  | NoteFragment.BraceEnd
  | NoteFragment.ErroredNote
  | NoteFragment.Comment;

// namespace VoicedNotes {
//   type NoteDuration = {
//     beatClock: BeatClock;
//     beatClockStr: string;
//     tick: string;
//   };

//   export type Chord = NoteFragments.ChordNote & {
//     chord: NoteFragments.ChordNote["chord"] & {
//       duration: NoteDuration;
//     };
//   };

//   export type Rest = NoteFragments.RestNote & {
//     duration: NoteDuration;
//   };

//   export type Repeat = NoteFragments.RepeatNote & {
//     repeat: NoteFragments.RepeatNote["repeat"] & {
//       note: Chord["chord"];
//       duration: NoteDuration;
//     };
//   };

//   export type MeasureSeparator = NoteFragments.MeasureSeparator & {};

//   export type KeyChange = NoteFragments.KeyChangeNote & {};

//   export type BraceBegin = NoteFragments.BraceBegin & {};

//   export type BraceEnd = NoteFragments.BraceEnd & {};

//   export type CommentLine = NoteFragments.CommentLine & {};

//   export type Characters = NoteFragments.Characters & {};

//   export type ErroredNote = NoteFragments.ErroredNote & {};
// }

// export type VoicedNotes =
//   | VoicedNotes.Chord
//   | VoicedNotes.Rest
//   | VoicedNotes.Repeat
//   | VoicedNotes.MeasureSeparator
//   | VoicedNotes.KeyChange
//   | VoicedNotes.BraceBegin
//   | VoicedNotes.BraceEnd
//   | VoicedNotes.CommentLine
//   | VoicedNotes.Characters
//   | VoicedNotes.ErroredNote;
