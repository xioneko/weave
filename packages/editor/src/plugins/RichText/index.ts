import type { EditorPlugin } from "#core/types.ts"
import RichTextPlugin from "./RichTextPlugin.vue"
import { $createHeadingNode, HeadingNode, type HeadingTagType } from "./nodes/HeadingNode"
import { HorizontalRuleNode } from "./nodes/HorizontalRuleNode"
import { QuoteNode } from "./nodes/QuoteNode"
import { $createParagraphNode, TEXT_TYPE_TO_FORMAT } from "lexical"

export * from "./nodes/HeadingNode"
export * from "./nodes/QuoteNode"
export * from "./nodes/HorizontalRuleNode"

export default {
  id: "builtin:rich-text",
  component: RichTextPlugin,
  nodes: [HeadingNode, QuoteNode, HorizontalRuleNode],
  markdown: {
    textFormatTagMap: {
      [TEXT_TYPE_TO_FORMAT["bold"]]: { tag: "**" },
      [TEXT_TYPE_TO_FORMAT["italic"]]: { tag: "*" },
      [TEXT_TYPE_TO_FORMAT["strikethrough"]]: { tag: "~~" },
      // [TEXT_TYPE_TO_FORMAT["underline"]]: { tag: "++" },
      [TEXT_TYPE_TO_FORMAT["code"]]: { tag: "`" },
      // [TEXT_TYPE_TO_FORMAT["subscript"]]: { tag: "~" },
      // [TEXT_TYPE_TO_FORMAT["superscript"]]: { tag: "^" },
      // [TEXT_TYPE_TO_FORMAT["highlight"]]: { tag: "==" },
    },
    tokenParserMap: {
      paragraph: {
        type: "node",
        createNode() {
          return $createParagraphNode()
        },
      },
      heading: {
        type: "node",
        createNode(token) {
          return $createHeadingNode(token.tag as HeadingTagType)
        },
      },
      blockquote: {
        type: "node",
        createNode() {
          return new QuoteNode()
        },
      },
      hr: {
        type: "node",
        createNode() {
          return new HorizontalRuleNode()
        },
      },
      em: {
        type: "format",
        getFormat() {
          return TEXT_TYPE_TO_FORMAT["italic"]
        },
      },
      strong: {
        type: "format",
        getFormat() {
          return TEXT_TYPE_TO_FORMAT["bold"]
        },
      },
      code_inline: {
        type: "format",
        getFormat() {
          return TEXT_TYPE_TO_FORMAT["code"]
        },
      },
      s: {
        type: "format",
        getFormat() {
          return TEXT_TYPE_TO_FORMAT["strikethrough"]
        },
      },
    },
  },
} satisfies EditorPlugin
