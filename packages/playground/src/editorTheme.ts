import * as css from "./editorTheme.css"
import type { EditorThemeClasses } from "lexical"

export const editorTheme: EditorThemeClasses = {
  paragraph: "Editor__p " + css.p,
  list: {
    ol: "Editor__ol " + css.ol,
    ul: "Editor__ul " + css.ul,
    listitem: "Editor__listItem " + css.listItem,
    checklist: "Editor__checklist",
    ulDepth: [
      "Editor__ulDepth1 " + css.ulDepth[0],
      "Editor__ulDepth2 " + css.ulDepth[1],
      "Editor__ulDepth3 " + css.ulDepth[2],
    ],
    olDepth: [
      "Editor__olDepth1 " + css.olDepth[0],
      "Editor__olDepth2 " + css.olDepth[1],
      "Editor__olDepth3 " + css.olDepth[2],
    ],
  },
  quote: "Editor__quote " + css.quote,
  link: "Editor__link " + css.link,
  heading: {
    h1: "Editor__h1 " + css.heading.h1,
    h2: "Editor__h2 " + css.heading.h2,
    h3: "Editor__h3 " + css.heading.h3,
    h4: "Editor__h4 " + css.heading.h4,
    h5: "Editor__h5 " + css.heading.h5,
    h6: "Editor__h6 " + css.heading.h6,
  },
  hr: "Editor__hr " + css.hr,
  text: {
    bold: "Editor__textBold " + css.text.bold,
    code: "Editor__textCode " + css.text.code,
    italic: "Editor__textItalic " + css.text.italic,
    strikethrough: "Editor__textStrikethrough " + css.text.strikethrough,
    subscript: "Editor__textSubscript " + css.text.subscript,
    superscript: "Editor__textSuperscript " + css.text.superscript,
    underline: "Editor__textUnderline " + css.text.underline,
    underlineStrikethrough: "Editor__textUnderlineStrikethrough " + css.text.underlineStrikethrough,
  },
  table: "Editor__table " + css.table,
  tableResizer: "Editor__tableResizer " + css.tableResizer,
  tableCell: "Editor__tableCell " + css.tableCell,
  tableScrollableWrapper: "Editor__tableScrollableWrapper " + css.tableScrollableWrapper,
}
