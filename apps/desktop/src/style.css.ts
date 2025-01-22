import { globalStyle } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

globalStyle("body", {
  color: vars.colors.gray12,
  backgroundColor: vars.colors.gray1,
  height: "100vh",
})
