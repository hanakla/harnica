import { type NoteFragmentType } from "@hanakla/harnica-midi";
import { StoreApi, create } from "zustand";
import { persist } from "zustand/middleware";

type Store = {
  currentScoreId: string | null;
  pointedNoteIndex: number | null;
  playingNoteIndex: number | null;
  progression: NoteFragmentType[];
  value: string;
  setPlayingNoteIndex: (index: number | null) => void;
  setProgression: (prog: NoteFragmentType[]) => void;
  set: StoreApi["setState"];
};

export const useEditorStore = create<Store>()(
  persist(
    (set, get) => ({
      currentScoreId: null,
      pointedNoteIndex: null,
      playingNoteIndex: null,
      progression: [],
      value: "",
      setPlayingNoteIndex: (index) => set({ playingNoteIndex: index }),
      setProgression: (prog) => set({ progression: prog }),
      set,
    }),
    {
      name: "editorState",
      partialize(state) {
        return {
          value: state.value,
        };
      },
    },
  ),
);
