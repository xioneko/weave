import { globalStyle, style } from "@vanilla-extract/css"

globalStyle("body", {
  vars: {
    "--title-bar-frame-padding-left": IS_MAC ? "82px" : "0px",
    "--title-bar-frame-padding-right": IS_MAC ? "0px" : "150px",
    "--title-bar-frame-height": "40px",
  },
})

export const titleBar = style({
  position: "fixed",
  top: "0",
  left: "0",
  height: "var(--title-bar-frame-height)",
  width: "100%",
  overflow: "hidden",
  userSelect: "none",
  WebkitUserSelect: "none",
})
