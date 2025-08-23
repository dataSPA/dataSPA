import type { AttributePlugin } from "../../engine/types";

export const ReplaceUrl: AttributePlugin = {
  type: "attribute",
  name: "replaceUrl",
  keyReq: "denied",
  valReq: "must",
  returnsValue: true,
  onLoad: ({ effect, rx }) =>
    effect(() => {
      const url = rx<string>();
      const baseUrl = window.location.href;
      const fullUrl = new URL(url, baseUrl).toString();
      window.history.replaceState({}, "", fullUrl);
    }),
};
