import { style } from "@vanilla-extract/css"
import { PopperCSSVar } from "@weave/ui/components/Popper"
import { vars } from "@weave/ui/theme"

function v(value: string, fallback?: string) {
  return `var(${value}${fallback ? `, ${fallback}` : ""})`
}

export const trigger = style({
  display: "flex",
  alignItems: "center",
  gap: "2px",
  paddingInline: "5px",
  borderRadius: vars.rounded.sm,
  color: vars.colors.grayA9,
  fontSize: vars.text.xs,
  userSelect: "none",
  WebkitUserSelect: "none",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.grayA2,
    },
    "&:active": {
      backgroundColor: vars.colors.grayA3,
    },
  },
})

export const content = style({
  display: "flex",
  flexDirection: "column",
  padding: "6px",
  width: "228px",
  maxHeight: `min(${v(PopperCSSVar.availableHeight)}, 50vh)`,
  fontSize: vars.text.sm,
  borderRadius: vars.rounded.md,
  boxShadow: vars.shadow.md,
  backgroundColor: vars.colors.gray2,
})

export const input = style({
  padding: "6px",
  margin: "6px",
  borderRadius: vars.rounded.md,
  fontSize: vars.text.sm,
  border: "1px solid",
  borderColor: vars.colors.gray5,
  backgroundColor: vars.colors.gray3,
  selectors: {
    "&:focus": {
      outline: "solid 2px",
      outlineColor: vars.colors.blueA4,
    },
    "&::placeholder": {
      color: vars.colors.grayA8,
    },
  },
})

export const list = style({
  overflow: "hidden auto",
  marginTop: "6px",
  selectors: {
    "&[data-empty]": {
      marginTop: "0",
    },
  },
})

export const item = style({
  padding: "4px 6px",
  cursor: "pointer",
  borderRadius: vars.rounded.md,
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.gray4,
    },
    "&[data-selected]": {
      backgroundColor: vars.colors.gray5,
    },
  },
})
