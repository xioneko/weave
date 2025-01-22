import type { SlashMenuItem } from "#plugins/SlashMenu"
import { $getBlockElementNodeAtPoint } from "#shared/selection.ts"
import {
  $createListItemNode,
  $createListNode,
  $createListParagraphNode,
  type ListType,
} from "./nodes"
import { List } from "@weave/ui/icons"
import { $isParagraphNode, type RangeSelection } from "lexical"

export const slashMenuItems: SlashMenuItem[] = [
  {
    id: "list:bullet",
    title: "Bulleted List",
    icon: List.Bullet,
    action(editor, selection) {
      editor.update(() => {
        $insertList("bullet", selection)
      })
    },
  },
  {
    id: "list:number",
    title: "Numbered List",
    icon: List.Number,
    action(editor, selection) {
      editor.update(() => {
        $insertList("number", selection)
      })
    },
  },
  {
    id: "list:check",
    title: "Todo List",
    icon: List.Todo,
    action(editor, selection) {
      editor.update(() => {
        $insertList("check", selection)
      })
    },
  },
]

function $insertList(listType: ListType, selection: RangeSelection) {
  const block = $getBlockElementNodeAtPoint(selection.anchor)
  if (block) {
    const list = $createListNode(listType)
    const listItem = $createListItemNode()
    const listParagraph = $createListParagraphNode()
    listItem.append(listParagraph)
    list.append(listItem)
    if (block.isEmpty() && $isParagraphNode(block)) {
      block.replace(list)
    } else {
      block.insertAfter(list)
    }
    listParagraph.select(0, 0)
  }
}
