import { create } from "zustand";
import type { SearchInput } from "@/adapters/types";

interface SearchState {
  current: SearchInput | null;
  history: SearchInput[];
  submitSearch: (input: SearchInput) => void;
  clearHistory: () => void;
}

function sameInput(a: SearchInput, b: SearchInput): boolean {
  return a.query === b.query && a.entityType === b.entityType;
}

export const useSearchStore = create<SearchState>((set) => ({
  current: null,
  history: [],
  submitSearch: (input) => set((s) => ({
    current: input,
    history: s.history.length && sameInput(s.history[0], input)
      ? s.history
      : [input, ...s.history].slice(0, 10),
  })),
  clearHistory: () => set({ history: [] }),
}));
