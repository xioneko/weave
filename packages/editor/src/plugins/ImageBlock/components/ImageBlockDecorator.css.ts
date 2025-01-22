import { style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

export const root = style({
  display: "flex",
  justifyContent: "center",
  paddingInline: "12px",
  selectors: {
    "&:not([data-resizing])": {
      cursor: "text",
    },
  },
})

export const container = style({
  position: "relative",
  selectors: {
    [`${root}:not([data-resizing]) > &`]: {
      cursor: "default",
    },
  },
})

export const controls = style({
  opacity: 0,
  transition: "opacity 0.2s",
  selectors: {
    "&[data-show]": {
      opacity: 1,
    },
  },
})

const resizerBase = style({
  position: "absolute",
  top: 0,
  bottom: 0,
  height: "48px",
  maxHeight: "50%",
  marginBlock: "auto",
  width: "5px",
  border: "1px solid",
  borderColor: vars.colors.whiteA5,
  borderRadius: vars.rounded.full,
  backgroundColor: vars.colors.blackA7,
  cursor: "col-resize",
  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.blackA9,
    },
  },
})

export const resizer = {
  left: style([
    resizerBase,
    {
      left: "4px",
    },
  ]),
  right: style([
    resizerBase,
    {
      right: "4px",
    },
  ]),
}
