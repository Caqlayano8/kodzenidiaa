import { create } from "zustand";
import type { Match, Prediction, FilterOptions } from "./types";

interface AppState {
  matches: Match[];
  liveMatches: Match[];
  predictions: Map<string, Prediction>;
  filters: FilterOptions;
  isLoading: boolean;
  lastUpdate: string;
  setMatches: (matches: Match[]) => void;
  setLiveMatches: (matches: Match[]) => void;
  addPrediction: (prediction: Prediction) => void;
  setFilters: (filters: FilterOptions) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (time: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  matches: [],
  liveMatches: [],
  predictions: new Map(),
  filters: {},
  isLoading: false,
  lastUpdate: "",
  setMatches: (matches) => set({ matches }),
  setLiveMatches: (matches) => set({ liveMatches: matches }),
  addPrediction: (prediction) =>
    set((state) => {
      const newMap = new Map(state.predictions);
      newMap.set(prediction.matchId, prediction);
      return { predictions: newMap };
    }),
  setFilters: (filters) => set({ filters }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));
