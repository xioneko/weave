import { createVar, globalStyle, style } from "@vanilla-extract/css"

export const controls = style({
  position: "fixed",
  top: "0",
  right: "0",
  display: "inline-flex",
  height: "var(--title-bar-frame-height)",
})

const btnColor = {
  text: createVar(),
  hoverBg: createVar(),
  activeBg: createVar(),
}

const darkColor = {
  [btnColor.text]: "rgb(255 255 255 / 1)",
  [btnColor.hoverBg]: "rgb(255 255 255 / 0.06)",
  [btnColor.activeBg]: "rgb(255 255 255 / 0.04)",
}

const lightColor = {
  [btnColor.text]: "rgb(0 0 0 / 0.9)",
  [btnColor.hoverBg]: "rgb(0 0 0 / 0.05)",
  [btnColor.activeBg]: "rgb(0 0 0 / 0.03)",
}

const button = style({
  maxHeight: "2rem",
  width: "46px",
  cursor: "default",
  borderRadius: "0",
  display: "grid",
  placeContent: "center",
  transition: "background-color 0.1s",

  vars: lightColor,

  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: darkColor,
    },
  },
})

globalStyle(`.dark ${button}`, {
  vars: darkColor,
})

globalStyle(`.light ${button}`, {
  vars: lightColor,
})

export const minmaxBtn = style([
  button,
  {
    color: btnColor.text,
    selectors: {
      "&:hover": {
        backgroundColor: btnColor.hoverBg,
      },
      "&:active": {
        backgroundColor: btnColor.activeBg,
      },
    },
  },
])

export const closeBtn = style([
  button,
  {
    color: btnColor.text,
    selectors: {
      "&:hover": {
        color: "white",
        backgroundColor: "rgb(196 43 28 / 1)",
      },
      "&:active": {
        backgroundColor: "rgb(196 43 28 / 0.9)",
      },
    },
  },
])
