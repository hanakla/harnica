import { create } from "zustand";

type NoteDetailStore = {
  activeTab: string | null;
  setActiveTab: (page: string) => void;
  changeToPrevTab: () => void;
  changeToNextTab: () => void;
};

const TAB_PAGES = ["tds", "next", "inversion", "scale", "on-scale"];

export const useNoteDetailStore = create<NoteDetailStore>((set, get) => ({
  activeTab: null,
  setActiveTab: (page: string) => set({ activeTab: page }),
  changeToPrevTab: () => {
    const currentIndex = TAB_PAGES.indexOf(get().activeTab ?? TAB_PAGES[0]);
    const prevIndex = (currentIndex - 1 + TAB_PAGES.length) % TAB_PAGES.length;
    set({ activeTab: TAB_PAGES[prevIndex] });
  },
  changeToNextTab: () => {
    const currentIndex = TAB_PAGES.indexOf(get().activeTab ?? TAB_PAGES[0]);
    const nextIndex = currentIndex + (1 % TAB_PAGES.length);
    set({ activeTab: TAB_PAGES[nextIndex] });
  },
}));
