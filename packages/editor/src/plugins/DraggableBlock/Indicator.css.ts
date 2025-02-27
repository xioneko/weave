import { style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

export const dragIndicator = style({
  position: "absolute",
  top: 0,
  left: 0,
  cursor: "grab",
  transition: "transform 0.2s ease, opacity 0.3s 0.2s",
  opacity: 0,
  color: vars.colors.grayA7,
  borderRadius: vars.rounded.sm,
  selectors: {
    "&[data-show]": {
      opacity: 1,
    },
    "&:hover": {
      opacity: 1,
      color: vars.colors.grayA9,
      backgroundColor: vars.colors.grayA3,
    },
    "&:active": {
      cursor: "grabbing",
    },
  },
})

export const dropIndicator = style({
  position: "absolute",
  top: 0,
  left: 0,
  height: "2px",
  backgroundColor: vars.colors.blue7,
  pointerEvents: "none",
  selectors: {
    "&::before": {
      content: '""',
      display: "block",
      position: "absolute",
      width: "8px",
      height: "8px",
      left: "-7px",
      top: "-3.5px",
      border: "2px solid",
      borderColor: vars.colors.blue7,
      borderRadius: vars.rounded.full,
    },
  },
})
