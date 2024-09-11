/** キー名の文字列表現 (e.g. 'C', 'D#', 'Fb') */
export type KeyString = string & { [keyStringType]: never };
declare const keyStringType: unique symbol;

const keyStringRegex = /^[A-G][#b]?$/;
export function assertKeyString(str: string): asserts str is KeyString {
  if (!keyStringRegex.test(str)) {
    throw new Error(`Invalid key string: ${str}`);
  }
}

export type BeatClock = [bars: number, beats: number, sixteeth: number];

export type NoteQuality =
  | [type: "quality", argument: "M" | "m"]
  | [type: "quality", argument: "M" | "m", argument: "7"]
  | [
      type: "omit" | "dim" | "aug" | "sus" | "add" | "tension",
      argument: string,
    ];

export type NoteMatch = {
  start: number;
  length: number;
  string: string;
};

export type NoteMatchFragment = {
  note: NoteParseResult | null;
  data: {
    key: string | null;
    sig: { [keyValue: number]: { isDegree: boolean; offset: number } };
    noteIdx: number | null;
    bar: number;
    notesInThisBar: number;
    isDegree: boolean | null;
    groupDepth: number;
    /** number of `type: 'note'` notes in this group. this number available only "beginBrace" note */
    notesInThisGroup: number | null;
  };
  match: NoteMatch;
};

export namespace NoteParseResult {
  export type Note = {
    type: "note";
    keyValues: number[];
    /** keys likes 'C3' */
    keys: string[];
    octave: -1 | 0 | 1;
    isDegree: boolean;
    resolveKey: string | null;
    detail: {
      root: string;
      degreeRoot: string;
      qualities: NoteQuality[];
      /** Degree or Alphabet notation chord name */
      originalChordName: string;
      /** Alphabet notation chord name (resolved or not) */
      chordName: string;
      warns: Array<{ type: string; message: string }>;
    };
    match: NoteMatch;
  };

  export type Repeat = { type: "repeat"; match: NoteMatch };

  export type Rest = { type: "rest"; match: NoteMatch };

  export type KeyChange = {
    type: "keyChange";
    key: string;
    match: NoteMatch;
  };

  export type SignatureChange = {
    type: "signatureChange";
    sigs: Array<{
      isDegree: boolean;
      targetKey: number;
      offset: number;
    }>;
    match: NoteMatch;
  };

  export type VoidSpace = {
    type: "voidSpace";
    match: NoteMatch;
  };

  export type Error = {
    type: "error";
    error: globalThis.Error;
    match: NoteMatch;
  };

  export type BraceBegin = {
    type: "braceBegin";
    match: NoteMatch;
  };

  export type BraceEnd = {
    type: "braceEnd";
    match: NoteMatch;
  };
}

export type NoteParseResult =
  | NoteParseResult.Note
  | NoteParseResult.Repeat
  | NoteParseResult.Rest
  | NoteParseResult.KeyChange
  | NoteParseResult.SignatureChange
  | NoteParseResult.VoidSpace
  | NoteParseResult.BraceBegin
  | NoteParseResult.BraceEnd
  | NoteParseResult.Error;
