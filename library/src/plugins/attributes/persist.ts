import { DATASTAR } from "../../engine/consts";
import { SignalFilterOptions, type AttributePlugin } from "../../engine/types";

export const Persist: AttributePlugin = {
  type: "attribute",
  name: "persist",
  keyReq: "denied",
  onLoad: ({ key, effect, mods, rx, mergePatch, filtered }) => {
    if (!key) {
      key = DATASTAR;
    }
    const storage = mods.has("session") ? sessionStorage : localStorage;

    const data = storage.getItem(key);
    if (data) {
      try {
        let storedSignals = JSON.parse(data);
        mergePatch(storedSignals);
        storage.setItem(key, "{}");
      } catch (error) {
        console.error("Error parsing persisted data:", error);
      }
    }

    effect(() => {
      let value = rx() as SignalFilterOptions;
      const filteredValue = filtered(value);
      const stringified = JSON.stringify(filteredValue);
      storage.setItem(key, stringified);
    });
  },
};
