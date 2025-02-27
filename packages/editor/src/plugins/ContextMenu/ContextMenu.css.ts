import { style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

export const content = style({
  display: "flex",
  flexDirection: "column",
  overflow: "hidden auto",
  border: `1px solid ${vars.colors.gray6}`,
  borderRadius: vars.rounded.md,
  boxShadow: vars.shadow.sm,
  minWidth: "240px",
  maxHeight: "calc(100vh - 32px)",
  padding: "6px",
  fontSize: vars.text.sm,
  color: vars.colors.gray12,
  backgroundColor: vars.colors.gray2,
  outline: "none",
})

export const item = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 6px",
  borderRadius: vars.rounded.md,
  cursor: "pointer",
  outline: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
  selectors: {
    "&[data-highlighted]": {
      backgroundColor: vars.colors.gray4,
    },
    "&[data-disabled]": {
      color: vars.colors.gray8,
      cursor: "default",
    },
  },
})

export const keyboardShortcut = style({
  fontSize: vars.text.xs,
  color: vars.colors.gray11,
})

export const subTrigger = style([
  item,
  {
    selectors: {
      "&[data-active]": {
        backgroundColor: vars.colors.gray4,
      },
    },
  },
])

export const separator = style({
  height: 1,
  flex: "0 0 auto",
  width: "100%",
  marginBlock: "6px",
  backgroundColor: vars.colors.gray6,
})
