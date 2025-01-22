import { vars } from "./contract.css"
import { DarkTheme, LightTheme, ThemeAttr } from "./useDarkMode"
import {
  blackA,
  whiteA,
  gray,
  grayA,
  grayDark,
  grayDarkA,
  blue,
  blueDark,
  blueA,
  blueDarkA,
  slate,
  slateA,
  slateDark,
  slateDarkA,
} from "@radix-ui/colors"
import { assignVars, globalStyle } from "@vanilla-extract/css"

globalStyle(":root", {
  colorScheme: "light dark",
  vars: assignVars(vars, {
    text: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      h1: "1.8em",
      h2: "1.6em",
      h3: "1.44em",
      h4: "1.25em",
      h5: "1.125em",
      h6: "1em",
      p: "1em",
    },
    rounded: {
      none: "0",
      xs: "0.125rem",
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px",
    },
    shadow: {
      none: "0 0 #0000",
      xs: "0 1px 2px 0 rgba(0 0 0 / 0.05)",
      sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    },
    colors: {
      ...blackA,
      ...whiteA,
      ...gray,
      ...grayA,
      ...slate,
      ...slateA,
      ...blue,
      ...blueA,
    },
  }),
  "@media": {
    "(prefers-color-scheme: dark)": {
      vars: assignVars(vars.colors, {
        ...blackA,
        ...whiteA,
        ...grayDark,
        ...grayDarkA,
        ...slateDark,
        ...slateDarkA,
        ...blueDark,
        ...blueDarkA,
      }),
    },
  },
})

globalStyle(`[${ThemeAttr}=${DarkTheme}]:root`, {
  vars: assignVars(vars.colors, {
    ...blackA,
    ...whiteA,
    ...grayDark,
    ...grayDarkA,
    ...slateDark,
    ...slateDarkA,
    ...blueDark,
    ...blueDarkA,
  }),
})

globalStyle(`[${ThemeAttr}=${LightTheme}]:root`, {
  vars: assignVars(vars.colors, {
    ...blackA,
    ...whiteA,
    ...gray,
    ...grayA,
    ...slate,
    ...slateA,
    ...blue,
    ...blueA,
  }),
})
