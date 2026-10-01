import { useProgressStore } from "./progressStore";
import { usePreferencesStore } from "./preferencesStore";

/** persist is absent when browser storage is blocked, so the stores just keep their defaults. */
export async function rehydrateStores(): Promise<void> {
  await useProgressStore.persist?.rehydrate();
  await usePreferencesStore.persist?.rehydrate();
}
