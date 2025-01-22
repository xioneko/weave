import { createGlobalThemeContract } from "@vanilla-extract/css"
import { IntRange } from "type-fest"

const Steps = 12
const Scales = ["blackA", "whiteA", "gray", "grayA", "blue", "blueA", "slate", "slateA"] as const
type ScaleWithSteps = `${(typeof Scales)[number]}${IntRange<1, 13>}`
type ColorContract = { [key in ScaleWithSteps]: key }

const Colors = Scales.flatMap(scale =>
  Array.from({ length: Steps }, (_, i) => `${scale}${i + 1}` as ScaleWithSteps),
)

export const vars = createGlobalThemeContract({
  colors: Colors.reduce((acc, color) => ({ ...acc, [color]: color }), {} as ColorContract),
  text: {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
    "6xl": "text-6xl",
    h1: "text-h1",
    h2: "text-h2",
    h3: "text-h3",
    h4: "text-h4",
    h5: "text-h5",
    h6: "text-h6",
    p: "text-p",
  },
  rounded: {
    none: "rounded-none",
    xs: "rounded-xs",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  },
  shadow: {
    none: "shadow-none",
    xs: "shadow-xs",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
    inner: "shadow-inner",
  },
})
