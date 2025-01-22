import type { SVGComponent } from "./types"
import LucideBold from "~icons/lucide/bold"
import LucideCode from "~icons/lucide/code"
import LucideCopy from "~icons/lucide/copy"
import LucideCopyCheck from "~icons/lucide/copy-check"
import LucideEdit from "~icons/lucide/edit"
import LucideHeading1 from "~icons/lucide/heading-1"
import LucideHeading2 from "~icons/lucide/heading-2"
import LucideHeading3 from "~icons/lucide/heading-3"
import LucideHeading4 from "~icons/lucide/heading-4"
import LucideHeading5 from "~icons/lucide/heading-5"
import LucideHeading6 from "~icons/lucide/heading-6"
import LucideImage from "~icons/lucide/image"
import LucideItalic from "~icons/lucide/italic"
import LucideLink from "~icons/lucide/link"
import LucideList from "~icons/lucide/list"
import LucideListOrdered from "~icons/lucide/list-ordered"
import LucideListTodo from "~icons/lucide/list-todo"
import LucideSquareCode from "~icons/lucide/square-code"
import LucideStrikethrough from "~icons/lucide/strikethrough"
import LucideSubscript from "~icons/lucide/subscript"
import LucideSuperscript from "~icons/lucide/superscript"
import LucideTable from "~icons/lucide/table"
import LucideType from "~icons/lucide/type"
import LucideUnderline from "~icons/lucide/underline"
import LucideUnlink from "~icons/lucide/unlink"
import MaterialSymbolsDragIndicator from "~icons/material-symbols/drag-indicator"
import MaterialSymbolsFormatParagraphRounded from "~icons/material-symbols/format-paragraph-rounded"
import MaterialSymbolsFormatQuoteOutlineRounded from "~icons/material-symbols/format-quote-outline-rounded"
import MaterialSymbolsHorizontalRuleRounded from "~icons/material-symbols/horizontal-rule-rounded"

export const Paragraph: SVGComponent = MaterialSymbolsFormatParagraphRounded

export const Heading: Record<string, SVGComponent> = {
  H1: LucideHeading1,
  H2: LucideHeading2,
  H3: LucideHeading3,
  H4: LucideHeading4,
  H5: LucideHeading5,
  H6: LucideHeading6,
}

export const Quote: SVGComponent = MaterialSymbolsFormatQuoteOutlineRounded

export const HorizontalRule: SVGComponent = MaterialSymbolsHorizontalRuleRounded

export const List: Record<string, SVGComponent> = {
  Bullet: LucideList,
  Number: LucideListOrdered,
  Todo: LucideListTodo,
}

export const Table: SVGComponent = LucideTable

export const CodeBlock: SVGComponent = LucideSquareCode

export const Image: SVGComponent = LucideImage

export const Format: Record<string, SVGComponent> = {
  Bold: LucideBold,
  Italic: LucideItalic,
  Underline: LucideUnderline,
  Strikethrough: LucideStrikethrough,
  Subscript: LucideSubscript,
  Superscript: LucideSuperscript,
  Code: LucideCode,
}

export const Copy: SVGComponent = LucideCopy
export const CopyCheck: SVGComponent = LucideCopyCheck

export const Edit: SVGComponent = LucideEdit

export const Type: SVGComponent = LucideType

export const Link: SVGComponent = LucideLink
export const Unlink: SVGComponent = LucideUnlink

export const DragIndicator: SVGComponent = MaterialSymbolsDragIndicator
