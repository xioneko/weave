import { style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

export const root = style({
  display: "flex",
  borderRadius: vars.rounded.sm,
  fontSize: vars.text.sm,
  boxShadow: vars.shadow.sm,
  color: vars.colors.gray11,
  backgroundColor: vars.colors.gray3,
  overflow: "hidden",
  zIndex: 1,
})

export const item = style({
  padding: "6px",
  height: "28px",
  width: "28px",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.gray4,
    },
    '&[data-state="on"]': {
      color: vars.colors.blue11,
    },
  },
})
