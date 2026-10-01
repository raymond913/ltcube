"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  cubeStyle: "stickered" | "stickerless";
  setCubeStyle: (style: "stickered" | "stickerless") => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      cubeStyle: "stickered",
      setCubeStyle: (style) => set({ cubeStyle: style }),
    }),
    { name: "ltcube-preferences", skipHydration: true },
  ),
);
