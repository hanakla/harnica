export type OnReplaceNoteHandler = (noteIndex: number, newNote: string) => void;
export type OnInsertNoteAfterHandler = (
  beforeNoteIndex: number,
  newNote: string,
) => void;

export type OnMoveCursorToNote = (noteIndex: number) => void;
