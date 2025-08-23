import type { AttributePlugin } from "../../engine/types";
import { supportsViewTransitions } from "../../utils/view-transitions";

// const VIEW_TRANSITION = "view-transition";

export const ViewTransition: AttributePlugin = {
  type: "attribute",
  name: "viewTransition",
  keyReq: "denied",
  valReq: "must",
  // onGlobalInit() {
  //   let hasViewTransitionMeta = false;
  //   for (const node of document.head.childNodes) {
  //     if (node instanceof HTMLMetaElement && node.name === VIEW_TRANSITION) {
  //       hasViewTransitionMeta = true;
  //     }
  //   }

  //   if (!hasViewTransitionMeta) {
  //     const meta = document.createElement("meta");
  //     meta.name = VIEW_TRANSITION;
  //     meta.content = "same-origin";
  //     document.head.appendChild(meta);
  //   }
  // },
  onLoad: ({ effect, el, rx }) => {
    if (!supportsViewTransitions) {
      console.error("Browser does not support view transitions");
      return;
    }
    return effect(() => {
      const name = rx<string>();
      if (!name?.length) return;
      const elVTASTyle = el.style as unknown as CSSStyleDeclaration;
      elVTASTyle.viewTransitionName = name;
    });
  },
};
