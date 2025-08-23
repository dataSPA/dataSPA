import { type AttributePlugin } from "../../engine/types";

const SMOOTH = "smooth";
const INSTANT = "instant";
const AUTO = "auto";
const HSTART = "hstart";
const HCENTER = "hcenter";
const HEND = "hend";
const HNEAREST = "hnearest";
const VSTART = "vstart";
const VCENTER = "vcenter";
const VEND = "vend";
const VNEAREST = "vnearest";
const CENTER = "center";
const START = "start";
const END = "end";
const NEAREST = "nearest";
const FOCUS = "focus";

// Scrolls the element into view
export const ScrollIntoView: AttributePlugin = {
  type: "attribute",
  name: "scrollIntoView",
  keyReq: "denied",
  valReq: "must",
  onLoad: ({ el, mods, runtimeErr }) => {
    if (!el.tabIndex) el.setAttribute("tabindex", "0");
    const opts: ScrollIntoViewOptions = {
      behavior: SMOOTH,
      block: CENTER,
      inline: CENTER,
    };
    if (mods.has(SMOOTH)) opts.behavior = SMOOTH;
    if (mods.has(INSTANT)) opts.behavior = INSTANT;
    if (mods.has(AUTO)) opts.behavior = AUTO;
    if (mods.has(HSTART)) opts.inline = START;
    if (mods.has(HCENTER)) opts.inline = CENTER;
    if (mods.has(HEND)) opts.inline = END;
    if (mods.has(HNEAREST)) opts.inline = NEAREST;
    if (mods.has(VSTART)) opts.block = START;
    if (mods.has(VCENTER)) opts.block = CENTER;
    if (mods.has(VEND)) opts.block = END;
    if (mods.has(VNEAREST)) opts.block = NEAREST;

    if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
      throw runtimeErr("ScrollIntoViewInvalidElement");
    }
    if (!el.tabIndex) {
      el.setAttribute("tabindex", "0");
    }

    el.scrollIntoView(opts);
    if (mods.has(FOCUS)) {
      el.focus();
    }
  },
};
