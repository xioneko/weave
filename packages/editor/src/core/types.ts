import type { MarkdownTokenParserMap, TextFormatTagMap } from "./markdown"
import { type Klass, type LexicalNode, type LexicalNodeReplacement } from "lexical"
import type MarkdownIt from "markdown-it"
import type { PartialDeep } from "type-fest"
import { type Component } from "vue"

export type PluginId = string

export type EditorPlugin = {
  readonly id: PluginId
  component: Component
  nodes?: (Klass<LexicalNode> | LexicalNodeReplacement)[]
  markdown?: {
    textFormatTagMap?: TextFormatTagMap
    tokenParserMap?: MarkdownTokenParserMap
    extend?: (md: MarkdownIt) => MarkdownIt
  }
}

export interface EditorConfig {
  disableEvents?: boolean
  namespace: string
  theme: EditorThemeClasses
}

export type EditorThemeClasses = PartialDeep<{
  paragraph: string
  quote: string
  heading: {
    h1: string
    h2: string
    h3: string
    h4: string
    h5: string
    h6: string
  }
  link: string
  list: {
    ol: string
    ul: string
    checklist: string
    listitem: string
    ulDepth: string[]
    olDepth: string[]
  }
  hr: string
  table: string
  tableScrollableWrapper: string
  tableCell: string
  tableResizer: string
  text: {
    bold: string
    italic: string
    underline: string
    strikethrough: string
    subscript: string
    superscript: string
    code: string
    underlineStrikethrough: string
  }
}>
