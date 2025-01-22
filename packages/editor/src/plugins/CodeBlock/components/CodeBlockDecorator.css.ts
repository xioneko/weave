import { globalStyle, style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

export const root = style({
  position: "relative",
  borderRadius: vars.rounded.md,
  overflowX: "auto",
})

export const header = style({
  display: "flex",
  alignItems: "end",
  justifyContent: "space-between",
  paddingBottom: "2px",
  height: "30px",
  paddingInline: "8px",
  opacity: 1,
  backgroundColor: "#282c34",
})

export const langPicker = style({
  position: "absolute",
  top: "8px",
  left: "8px",
  opacity: 0,
  transition: "opacity 0.4s",
  transitionDelay: "0.5s",
  selectors: {
    "&[data-opened]": {
      opacity: 1,
    },
    [`${root}:hover &`]: {
      opacity: 1,
      transitionDuration: "0.2s",
      transitionDelay: "0s",
    },
  },
})

export const editor = style({
  fontSize: vars.text.sm,
})

globalStyle(`${editor} .cm-editor`, {
  padding: "28px 18px 4px",
  outline: "none",
})

globalStyle(`${editor} .cm-scroller`, {
  padding: "0 6px 20px",
  outline: "none",
})
