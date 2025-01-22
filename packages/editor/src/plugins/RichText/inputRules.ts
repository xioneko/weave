import type { InputRule } from "#plugins/InputRule"
import { $createHeadingNode, type HeadingTagType } from "./nodes/HeadingNode"
import { $createHorizontalRuleNode } from "./nodes/HorizontalRuleNode"
import { $createQuoteNode } from "./nodes/QuoteNode"
import { $isParagraphNode } from "lexical"

export const inputRules: InputRule[] = [
  {
    type: "format",
    format: "bold",
    tag: "**",
    spaceAfter: true,
    priority: 1,
  },
  {
    type: "format",
    format: "italic",
    tag: "*",
    spaceAfter: true,
    priority: 0,
  },
  {
    type: "format",
    format: "strikethrough",
    tag: "~~",
    spaceAfter: true,
    priority: 1,
  },
  {
    type: "format",
    format: "code",
    tag: "`",
    spaceAfter: true,
    priority: 0,
  },
  // {
  //   type: "format",
  //   format: "superscript",
  //   tag: "^",
  // },
  // {
  //   type: "format",
  //   format: "subscript",
  //   tag: "~",
  // },
  // {
  //   type: "format",
  //   format: "underline",
  //   tag: "++",
  // },
  // {
  //   type: "format",
  //   format: "highlight",
  //   tag: "==",
  // },
  {
    type: "node",
    transform(node, offset, editor) {
      const block = node.getParent()
      if (!$isParagraphNode(block) || block.__first !== node.__key) return false
      const match = node.__text.slice(0, offset).match(/^(#{1,6}) $/)
      if (!match) return false
      editor.update(() => {
        const level = match[1].length
        node.spliceText(0, match[0].length, "")
        const heading = $createHeadingNode(`h${level}` as HeadingTagType)
        block.replace(heading, true)
        heading.select(0, 0)
      })
    },
  },
  {
    type: "node",
    transform(node, offset, editor) {
      if (!node.__text.endsWith("> ", offset)) return false
      const block = node.getParent()
      if (!$isParagraphNode(block) || block.__first !== node.__key) return false
      editor.update(() => {
        node.spliceText(0, 2, "")
        const quote = $createQuoteNode()
        block.replace(quote, true)
        quote.select(0, 0)
      })
    },
  },
  {
    type: "node",
    transform(node, offset, editor) {
      if (node.__text !== "--- ") return false
      const block = node.getParent()
      if (!$isParagraphNode(block) || block.__first !== node.__key) return false
      editor.update(() => {
        const hr = $createHorizontalRuleNode()
        block.replace(hr)
        hr.selectNext()
      })
    },
  },
]
