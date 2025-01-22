import { style } from "@vanilla-extract/css"
import { PopperCSSVar } from "@weave/ui/components/Popper"
import { vars } from "@weave/ui/theme"

export const content = style({
  display: "flex",
  flexDirection: "column",
  overflow: "hidden auto",
  borderRadius: vars.rounded.md,
  padding: "4px",
  fontSize: vars.text.sm,
  boxShadow: vars.shadow.sm,
  color: vars.colors.gray12,
  backgroundColor: vars.colors.gray2,
  maxHeight: `min(344px, var(${PopperCSSVar.availableHeight}))`,
  minWidth: "200px",
})

export const item = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "4px 6px",
  borderRadius: vars.rounded.md,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.gray4,
    },
    "&[data-selected]": {
      backgroundColor: vars.colors.gray5,
    },
  },
})

export const itemIcon = style({
  width: "26px",
  height: "26px",
  padding: "4px",
})
