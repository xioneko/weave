import { $createBlockSelection, SELECT_BLOCK_COMMAND } from "#core/nodes"
import { __assert__ } from "#shared/dev.ts"
import {
  $getBlockElementNodeAtPoint,
  $getBlockIfAtBlockStart,
  $splitNodeAtPoint,
} from "#shared/selection.ts"
import { $createListItemNode, $isListItemNode, type ListItemNode } from "./nodes/ListItemNode"
import { $isListNode } from "./nodes/ListNode"
import {
  $createListParagraphNode,
  $isListParagraphNode,
  ListParagraphNode,
} from "./nodes/ListParagraphNode"
import { mergeRegister } from "@lexical/utils"
import {
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  type LexicalEditor,
} from "lexical"

export function registerList(editor: LexicalEditor) {
  return mergeRegister(
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const node = selection.anchor.getNode()
          if ($isListParagraphNode(node)) {
            const listItem = node.getParent<ListItemNode>()!
            if (listItem.getChildrenSize() === 1) {
              // If the caret is at the start of an empty paragraph which is the only child of listItem
              const indent = listItem.getIndent()
              if (indent === 0) {
                listItem.collapseAtStart(selection)
              } else {
                // outdent
                listItem.setIndent(indent - 1)
              }
              event?.preventDefault()
              return true
            }
          } else {
            const parent = node?.getParent()
            if (
              $isListItemNode(parent) &&
              $isParagraphNode(node) &&
              parent.__last === node.__key &&
              node.isEmpty()
            ) {
              const listItem = $createListItemNode()
              parent.insertAfter(listItem)
              const paragraph = $createListParagraphNode()
              listItem.append(paragraph)
              node.remove()
              paragraph.select(0, 0)
              event?.preventDefault()
              return true
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          selection.removeText()
          const node = $getBlockElementNodeAtPoint(selection.anchor)
          if ($isListParagraphNode(node)) {
            let parent = selection.anchor.getNode()
            let offset = selection.anchor.offset
            while (!$isListParagraphNode(parent)) {
              ;[parent, offset] = $splitNodeAtPoint(parent, offset)
            }
            const newItem = parent.insertNewAfter(selection)
            const firstToAppend = parent.getChildAtIndex(offset)
            if (firstToAppend) {
              newItem.append(firstToAppend, ...firstToAppend.getNextSiblings())
            } else {
              newItem.append($createListParagraphNode())
            }
            newItem.append(...parent.getNextSiblings())
            newItem.selectStart()
            return true
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const node = $getBlockIfAtBlockStart(selection.anchor)
          if ($isListParagraphNode(node)) {
            const listItem = node.getParent<ListItemNode>()!
            const prevSibling = listItem.getPreviousSibling<ListItemNode>()
            if (prevSibling) {
              prevSibling.append(listItem)
              const firstChild = listItem.getFirstChild<ListParagraphNode>()!
              const paragraph = ListParagraphNode.toParagraph(firstChild)
              listItem.replace(paragraph, true)
              paragraph.select(0, 0)
            } else {
              listItem.collapseAtStart(selection)
            }
            event.preventDefault()
            return true
          } else {
            const parent = node?.getParent()
            if ($isListItemNode(parent) && $isParagraphNode(node)) {
              const list = parent.getParent()
              __assert__($isListNode(list), "Parent of ListItemNode should be a ListNode")
              if (parent.__last === node.__key && list.__last === parent.__key) {
                // The block is the last child of the last item of the list, move it out of the list
                list.insertAfter(node)
                event.preventDefault()
                return true
              }
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      SELECT_BLOCK_COMMAND,
      ({ node, selection }) => {
        if ($isListNode(node)) {
          let blockSelection = selection || $createBlockSelection()
          node.getChildren<ListItemNode>().forEach(child => {
            editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: child, selection: blockSelection })
          })
          if (!selection) {
            $setSelection(blockSelection)
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
  )
}
