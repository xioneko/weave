import { contentEditable } from "./styles.css"
import { globalStyle, style } from "@vanilla-extract/css"
import { vars } from "@weave/ui/theme"

const CHECKBOX_BLANK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5z'/%3E%3C/svg%3E"
const CHECKBOX_CHECKED =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5zm-9 12l-4-4l1.41-1.42L10 14.17l6.59-6.59L18 9'/%3E%3C/svg%3E"

function v(value: string, fallback?: string) {
  return `var(${value}${fallback ? `, ${fallback}` : ""})`
}

globalStyle("[data-block]", {
  position: "relative",
  paddingBlock: "6px",
  // Note: Adding margin to the block is not recommended,
  // as it will increase the difficulty of positioning the DND indicators
})

globalStyle("[data-block]::after", {
  content: '""',
  position: "absolute",
  height: 0, // Avoid being included in text selection in Safari
  top: "2px",
  right: "0",
  left: "-2px",
  bottom: "2px",
  borderRadius: vars.rounded.sm,
  backgroundColor: vars.colors.slateA3,
  pointerEvents: "none",
  opacity: 0,
  transition: "opacity 0.3s",
})

globalStyle("[data-block-selected]::after", {
  height: "auto",
  opacity: 1,
})

globalStyle("::selection", {
  backgroundColor: vars.colors.blueA4,
})

export const list = style({
  listStyleType: "none",
  selectors: {
    [`${contentEditable} > &`]: {
      paddingBottom: "6px",
    },
  },
})

export const ul = style([list])
export const ol = style([list])

export const ulDepth = [style({}), style({}), style({})]

export const olDepth = [
  style({
    counterReset: `ol0 calc(${v("--list-start", "1")} - 1)`,
  }),
  style({
    counterReset: `ol1 calc(${v("--list-start", "1")} - 1)`,
  }),
  style({
    counterReset: `ol2 calc(${v("--list-start", "1")} - 1)`,
  }),
]

export const listItem = style({
  display: "grid",
  gridTemplateColumns: "max-content minmax(0, auto)",
  gridAutoRows: "auto",
  paddingBottom: "0", // Avoid extra bottom padding in nested lists
  selectors: {
    "&::before": {
      display: "inline-block",
      fontFamily: "arial",
      minWidth: "24px",
      paddingInline: "0.25rem",
      justifySelf: "center",
      alignSelf: "start",
      whiteSpace: "nowrap",
      color: vars.colors.gray11,
    },
    "&::after": {
      top: "4px",
      bottom: "-2px",
    },
    [`${contentEditable} > ${list} > &:first-child`]: {},
    [`${ulDepth[0]}>&::before`]: {
      content: "'●'",
      transform: "scale(0.8)",
    },
    [`${ulDepth[1]}>&::before`]: {
      content: "'○'",
      transform: "scale(0.8)",
    },
    [`${ulDepth[2]}>&::before`]: {
      content: "'■'",
      transform: "scale(0.8)",
    },
    [`${olDepth[0]}>&::before`]: {
      counterIncrement: "ol0",
      content: "counter(ol0, decimal)'.'",
    },
    [`${olDepth[1]}>&::before`]: {
      counterIncrement: "ol1",
      content: "counter(ol1, lower-alpha)'.'",
    },
    [`${olDepth[2]}>&::before`]: {
      counterIncrement: "ol2",
      content: "counter(ol2, lower-roman)'.'",
    },
    "&[data-checked]": {
      cursor: "pointer",
    },
    "&[data-checked]::before": {
      width: "24px", // The checkbox's width depends on the clickable area (see List Plugin)
      height: "1lh",
      cursor: "pointer",
      backgroundColor: "currentcolor",
      mask: "no-repeat center / 1.375em",
    },
    "&[data-checked=true]::before": {
      maskImage: `url("${CHECKBOX_CHECKED}")`,
    },
    "&[data-checked=false]::before": {
      maskImage: `url("${CHECKBOX_BLANK}")`,
    },
  },
})

globalStyle(`${listItem}[data-checked] > *`, {
  cursor: "auto",
})

globalStyle(`${listItem} > :nth-child(n+2)`, {
  gridColumn: "2",
})

globalStyle(`${listItem} [data-block]`, {
  paddingBottom: 0,
})

export const p = style({
  fontSize: vars.text.p,
})

globalStyle(`${listItem}[data-checked=true] >:first-child`, {
  textDecoration: "line-through",
  color: vars.colors.gray11,
})

export const quote = style({
  borderLeft: `4px solid ${vars.colors.gray6}`,
  paddingLeft: "1rem",
  color: vars.colors.gray11,
})

export const heading = {
  h1: style({
    fontSize: vars.text.h1,
    fontWeight: "bold",
  }),
  h2: style({
    fontSize: vars.text.h2,
    fontWeight: "bold",
  }),
  h3: style({
    fontSize: vars.text.h3,
    fontWeight: "bold",
  }),
  h4: style({
    fontSize: vars.text.h4,
    fontWeight: "bold",
  }),
  h5: style({
    fontSize: vars.text.h5,
    fontWeight: "bold",
  }),
  h6: style({
    fontSize: vars.text.h6,
    fontWeight: "bold",
  }),
}

export const hr = style({
  border: "none",
  padding: "1rem 0",
  height: "auto",
  lineHeight: "0", // Make dragHandle position correctly
  selectors: {
    "&::before": {
      content: '""',
      display: "block",
      height: "1px",
      backgroundColor: vars.colors.gray6,
    },
  },
})

export const text = {
  bold: style({
    fontWeight: "bold",
  }),
  italic: style({
    fontStyle: "italic",
  }),
  underline: style({
    textDecoration: "underline",
  }),
  strikethrough: style({
    textDecoration: "line-through",
  }),
  underlineStrikethrough: style({
    textDecoration: "underline line-through",
  }),
  subscript: style({
    verticalAlign: "sub",
    fontSize: "0.8em",
  }),
  superscript: style({
    verticalAlign: "super",
    fontSize: "0.8em",
  }),
  code: style({
    backgroundColor: vars.colors.gray3,
    padding: "0.2em 0.3em",
    borderRadius: vars.rounded.sm,
    fontSize: vars.text.sm,
  }),
}

export const tableScrollableWrapper = style({
  position: "relative",
  outline: "none",
})

export const table = style({
  outline: "none",
  marginBlock: "4px",
  borderCollapse: "collapse",
  borderSpacing: "0",
})

export const tableResizer = style({
  position: "absolute",
  inset: "10px", // block padding + table margin
  width: "11px",
  paddingInline: "4px",
  backgroundClip: "content-box",
  backgroundColor: vars.colors.blue7,
  transform: "translateX(-50%)",
  cursor: "col-resize",
  opacity: 0,
  selectors: {
    "&:hover": {
      transition: "opacity 0.2s linear 0.1s",
      opacity: 1,
    },
    "&[data-resizing]": {
      opacity: 1,
    },
  },
})

globalStyle(`${listItem} > ${tableScrollableWrapper} > ${tableResizer}`, {
  bottom: "4px", // subtract the block padding
})

export const tableCell = style({
  outline: "none",
  padding: "6px 8px",
  border: "1px solid",
  minWidth: "64px",
  maxWidth: "256px",
  borderColor: vars.colors.gray6,
  wordBreak: "break-word",
  verticalAlign: "top",
  textAlign: "left",
  selectors: {
    "&[data-selected]": {
      backgroundColor: vars.colors.slateA3,
      caretColor: "transparent", // Hide the caret in Safari
    },
  },
})

export const link = style({
  color: vars.colors.slate11,
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
})
