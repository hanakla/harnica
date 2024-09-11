import { NoteFragment } from "@/internals/parser/types";

export function createBraceBeginNote(): NoteFragment.BraceBegin {
  return {
    type: "braceBegin",
    isSoundable: false,
    fragIndex: 0,
    match: {
      start: 0,
      end: 0,
      length: 0,
      string: "(",
    },
  };
}

export function createBraceEndNote(): NoteFragment.BraceEnd {
  return {
    type: "braceEnd",
    isSoundable: false,
    fragIndex: 0,
    match: {
      start: 0,
      end: 0,
      length: 0,
      string: ")",
    },
  };
}

export function createBarSeparatorNote(): NoteFragment.BarSeparator {
  return {
    type: "barSeparator",
    isSoundable: false,
    fragIndex: 0,
    match: {
      start: 0,
      end: 0,
      length: 0,
      string: "|",
    },
  };
}
