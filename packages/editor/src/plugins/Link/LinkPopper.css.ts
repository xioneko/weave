import { style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

export const tooltip = style({
  display: "flex",
  alignItems: "center",
  gap: "2px",
  padding: "6px 4px",
  height: "28px",
  borderRadius: vars.rounded.md,
  boxShadow: vars.shadow.sm,
  color: vars.colors.gray11,
  backgroundColor: vars.colors.gray2,
})

export const tooltipText = style({
  maxWidth: "200px",
  marginLeft: "4px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: vars.text.xs,
  selectors: {
    "&:empty": {
      marginLeft: "0",
    },
  },
})

export const tooltipBtn = style({
  display: "grid",
  placeContent: "center",
  padding: "4px",
  width: "22px",
  height: "22px",
  borderRadius: vars.rounded.md,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.gray4,
    },
  },
})

export const editor = style({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "12px",
  maxWidth: "calc(100vw - 24px)",
  width: "240px",
  borderRadius: vars.rounded.md,
  boxShadow: vars.shadow.sm,
  fontSize: vars.text.sm,
  color: vars.colors.gray11,
  backgroundColor: vars.colors.gray2,
})

export const editorLabel = style({
  display: "flex",
  alignItems: "center",
  padding: "4px",
  gap: "4px",
  borderRadius: vars.rounded.md,
  border: "1px solid",
  borderColor: vars.colors.gray5,
  backgroundColor: vars.colors.gray3,
  selectors: {
    "&:focus-within": {
      outline: "solid 2px",
      outlineColor: vars.colors.blueA4,
    },
  },
})

export const editorLabelIcon = style({
  display: "grid",
  placeContent: "center",
  width: "22px",
  height: "22px",
  padding: "4px",
})

export const editorInput = style({
  width: "100%",
  backgroundColor: vars.colors.gray3,
  outline: "none",
  selectors: {
    "&::placeholder": {
      color: vars.colors.grayA8,
    },
  },
})
