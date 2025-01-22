import { createGlobalVar, globalStyle, style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"
import "@weave/ui/theme/default"

globalStyle("body", {
  color: vars.colors.gray12,
  backgroundColor: vars.colors.gray1,
  width: "100%",
})

globalStyle("*::-webkit-scrollbar", {
  width: "10px",
  height: "10px",
})

globalStyle("*::-webkit-scrollbar-thumb", {
  border: "solid transparent",
  borderWidth: "2px 3.5px 3.5px 2px",
  backgroundColor: vars.colors.grayA9,
  backgroundClip: "content-box",
})

globalStyle("*::-webkit-scrollbar-thumb:vertical", {
  borderWidth: "3.5px 3.5px 3.5px 2px",
  borderRadius: "4.5px 6px 6px 4.5px / 6.25px 6px 6px 6.25px",
})

globalStyle("*::-webkit-scrollbar-thumb:vertical:hover", {
  borderLeftWidth: "0px",
  borderRadius: "3.5px 6.5px 6.5px 3.5px / 7px",
  backgroundColor: vars.colors.gray10,
})

globalStyle("*::-webkit-scrollbar-thumb:horizontal", {
  borderWidth: "3.5px",
  borderRadius: "6px",
})

globalStyle("*::-webkit-scrollbar-thumb:horizontal:hover", {
  borderTopWidth: "1.5px",
  borderRadius: "6px / 3.5px 3.5px 6px 6px",
  backgroundColor: vars.colors.gray10,
})

globalStyle("*::-webkit-scrollbar-corner", {
  background: "transparent",
})

globalStyle("#app", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100vh",
  "@media": {
    "screen and (min-width: 768px)": {
      flexDirection: "row",
    },
  },
})

globalStyle("main", {
  position: "relative",
  flexGrow: 3,
  width: "100%",
  height: "60%",
  "@media": {
    "screen and (min-width: 768px)": {
      width: "60%",
      height: "100%",
    },
  },
})

const thumbColor = createGlobalVar("scrollbar-thumb-color", {
  syntax: "<color>",
  inherits: true,
  initialValue: "transparent",
})

const scrollbarAutoHide = style({
  transition: "--scrollbar-thumb-color 0.2s 0.2s",
  selectors: {
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: thumbColor,
    },
    "&:hover": {
      vars: {
        [thumbColor]: vars.colors.grayA9,
      },
    },
  },
})

export const editorViewport = style([
  scrollbarAutoHide,
  {
    height: "100%",
    overflow: "auto scroll !important",
    contentVisibility: "auto",
  },
])

export const contentEditable = style({
  boxSizing: "content-box",
  position: "relative",
  outline: "none",
  minWidth: "420px",
  maxWidth: "740px",
  minHeight: "360px",
  marginInline: "auto",
  padding: "108px 16%",
  fontSize: vars.text.base,
})

export const buttonGroup = style({
  position: "absolute",
  top: "12px",
  display: "flex",
  gap: "12px",
  right: "22px",
})

export const iconBtn = style({
  cursor: "pointer",
  height: "22px",
  width: "22px",
  color: vars.colors.slate12,
  opacity: 0.7,
  transition: "opacity 0.2s",
  selectors: {
    "&:hover": {
      opacity: 1,
    },
  },
})

export const tooltip = style({
  fontSize: vars.text.xs,
  color: vars.colors.gray11,
  backgroundColor: vars.colors.gray3,
  padding: "4px 8px",
  borderRadius: vars.rounded.md,
  userSelect: "none",
  WebkitUserSelect: "none",
  pointerEvents: "none",
})

export const toast = style({
  padding: "8px 16px",
  borderRadius: vars.rounded.lg,
  fontSize: vars.text.sm,
  backgroundColor: vars.colors.gray3,
})

export const menuContent = style({
  display: "flex",
  flexDirection: "column",
  padding: "6px 4px",
  border: `1px solid ${vars.colors.gray6}`,
  borderRadius: vars.rounded.md,
  fontSize: vars.text.sm,
  outline: "none",
  boxShadow: vars.shadow.sm,
  backgroundColor: vars.colors.gray2,
})

export const menuItem = style({
  userSelect: "none",
  cursor: "pointer",
  outline: "none",
  padding: "4px 8px",
  borderRadius: vars.rounded.md,
  selectors: {
    "&[data-highlighted]": {
      backgroundColor: vars.colors.gray4,
    },
  },
})

export const debugView = style([
  scrollbarAutoHide,
  {
    flexGrow: 2,
    width: "100%",
    height: "40%",
    overflow: "scroll",
    padding: "16px 0 0 12px",
    borderTop: `1px solid ${vars.colors.slate6}`,
    backgroundColor: vars.colors.slate2,
    "@media": {
      "screen and (min-width: 768px)": {
        width: "40%",
        height: "100%",
        borderTop: "none",
        borderLeft: `1px solid ${vars.colors.slate6}`,
      },
    },
  },
])

export const editorTreeView = style({
  height: "100%",
  width: "100%",
  fontSize: vars.text.sm,
})
