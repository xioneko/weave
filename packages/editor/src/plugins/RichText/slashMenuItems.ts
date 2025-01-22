import type { SlashMenuItem } from "#plugins/SlashMenu"
import { $getBlockElementNodeAtPoint } from "#shared/selection.ts"
import { $createHeadingNode } from "./nodes/HeadingNode"
import { $createHorizontalRuleNode } from "./nodes/HorizontalRuleNode"
import { $createQuoteNode } from "./nodes/QuoteNode"
import { Heading, Paragraph, Quote, HorizontalRule } from "@weave/ui/icons"
import {
  $createParagraphNode,
  $isParagraphNode,
  type ElementNode,
  type RangeSelection,
} from "lexical"

export const slashMenuItems: SlashMenuItem[] = [
  {
    id: "rich-text:p",
    title: "Paragraph",
    icon: Paragraph,
    action(editor, selection) {
      editor.update(() => {
        $insertAfterBlock($createParagraphNode(), selection)
      })
    },
  },
  {
    id: "rich-text:h1",
    title: "Heading 1",
    icon: Heading.H1,
    action(editor, selection) {
      editor.update(() => {
        $insertAfterBlock($createHeadingNode("h1"), selection)
      })
    },
  },
  {
    id: "rich-text:h2",
    title: "Heading 2",
    icon: Heading.H2,
    action(editor, selection) {
      editor.update(() => {
        $insertAfterBlock($createHeadingNode("h2"), selection)
      })
    },
  },
  {
    id: "rich-text:h3",
    title: "Heading 3",
    icon: Heading.H3,
    action(editor, selection) {
      editor.update(() => {
        $insertAfterBlock($createHeadingNode("h3"), selection)
      })
    },
  },
  {
    id: "rich-text:quote",
    title: "Quote",
    icon: Quote,
    action(editor, selection) {
      editor.update(() => {
        $insertAfterBlock($createQuoteNode(), selection)
      })
    },
  },
  {
    id: "rich-text:divider",
    title: "Divider",
    icon: HorizontalRule,
    action(editor, selection) {
      editor.update(() => {
        const block = $getBlockElementNodeAtPoint(selection.anchor)
        if (block) {
          const divider = $createHorizontalRuleNode()
          if (block.isEmpty() && $isParagraphNode(block)) {
            block.replace(divider)
          } else {
            block.insertAfter(divider)
          }
          if (divider.getNextSibling() !== null) {
            divider.selectNext()
          } else {
            const paragraph = $createParagraphNode()
            divider.insertAfter(paragraph)
            paragraph.selectStart()
          }
        }
      })
    },
  },
]

function $insertAfterBlock(node: ElementNode, selection: RangeSelection) {
  const block = $getBlockElementNodeAtPoint(selection.anchor)
  if (block) {
    if (block.isEmpty() && $isParagraphNode(block)) {
      block.replace(node)
    } else {
      block.insertAfter(node)
    }
    node.select(0, 0)
  }
}
