import type { InputRule } from "#plugins/InputRule"
import {
  $createListItemNode,
  $createListNode,
  $createListParagraphNode,
  type ListNode,
  type ListParagraphNode,
} from "./nodes"
import { $isParagraphNode, type ElementNode } from "lexical"

export const inputRules: InputRule[] = [
  {
    type: "node",
    transform(node, offset, editor) {
      const block = node.getParent()
      if (!$isParagraphNode(block) || block.__first !== node.__key) return false
      const match = node.__text.slice(0, offset).match(/^ ?[-*+] $/)
      if (!match) return false
      editor.update(() => {
        node.spliceText(0, match[0].length, "")
        const list = $createListNode("bullet")
        $replaceWithList(block, list).select(0, 0)
      })
    },
  },
  {
    type: "node",
    transform(node, offset, editor) {
      const block = node.getParent()
      if (!$isParagraphNode(block) || block.__first !== node.__key) return false
      const match = node.__text.slice(0, offset).match(/^ ?(\d{1,})\. $/)
      if (!match) return false
      editor.update(() => {
        node.spliceText(0, match[0].length, "")
        const list = $createListNode("number", parseInt(match[1]))
        $replaceWithList(block, list).select(0, 0)
      })
    },
  },
  {
    type: "node",
    transform(node, offset, editor) {
      const block = node.getParent()
      if (!$isParagraphNode(block) || block.__first !== node.__key) return false
      const match = node.__text.slice(0, offset).match(/^ ?\[([ xX]?)\] $/)
      if (!match) return false
      editor.update(() => {
        node.spliceText(0, match[0].length, "")
        const list = $createListNode("check")
        $replaceWithList(block, list, match[1] == "x" || match[1] === "X").select(0, 0)
      })
    },
  },
]

function $replaceWithList(
  block: ElementNode,
  list: ListNode,
  checked?: boolean,
): ListParagraphNode {
  const listItem = $createListItemNode(checked)
  const listParagraph = $createListParagraphNode()
  listItem.append(listParagraph)
  list.append(listItem)
  listParagraph.append(...block.getChildren())
  block.replace(list)
  return listParagraph
}
