import {
  $getBlockElementNodeAtPoint,
  $getElementNodeAtPoint,
  $isAtBlockEnd,
  $isAtBlockStart,
} from "#shared/selection.ts"
import { $isBlock, $isElementBlock, type BaseBlockNode, type ElementBlock } from "./BaseBlockNode"
import { $createBlockSelection, $isBlockSelection, BlockSelection } from "./BlockSelection"
import { $isDecoratorBlockNode } from "./DecoratorBlockNode"
import { $getClipboardDataFromSelection, copyToClipboard } from "@lexical/clipboard"
import { $findMatchingParent, IS_APPLE, mergeRegister, objectKlassEquals } from "@lexical/utils"
import {
  $createParagraphNode,
  $getAdjacentNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $normalizeSelection__EXPERIMENTAL,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  COPY_COMMAND,
  createCommand,
  CUT_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_MODIFIER_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type ElementNode,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
} from "lexical"

export const SELECT_BLOCK_COMMAND: LexicalCommand<{
  node: LexicalNode
  selection?: BlockSelection
}> = createCommand("SELECT_BLOCK_COMMAND")

export function registerBlock(editor: LexicalEditor) {
  let prevSelectedKeys = new Set<NodeKey>()
  return mergeRegister(
    /* -------------------------------- Selection ------------------------------- */
    // TODO: Block selection should not be part of the node state. History should not record selection changes.
    editor.registerCommand(
      SELECT_BLOCK_COMMAND,
      ({ node, selection }) => {
        if ($isBlock(node)) {
          if (!node.__blokSelected) {
            node.getWritable().__blokSelected = true
          }
          if (!selection) {
            selection = $createBlockSelection()
            selection.add(node)
            $setSelection(selection)
          } else {
            selection.add(node)
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if ($isBlockSelection(selection)) {
          const keys = selection._blocks
          prevSelectedKeys.difference(keys).forEach(key => {
            const block = $getNodeByKey<BaseBlockNode>(key)
            if (block) block.getWritable().__blokSelected = false
          })
          prevSelectedKeys = keys
          return true
        } else if (prevSelectedKeys.size > 0) {
          prevSelectedKeys.forEach(key => {
            const node = $getNodeByKey<BaseBlockNode>(key)
            if (node) node.getWritable().__blokSelected = false
          })
          prevSelectedKeys.clear()
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if ($isNodeSelection(selection) && selection._nodes.size === 1) {
          // In some cases (e.g. when pressing the backspace key after a decorator block), the
          // NodeSelection may contains a single block, and in order to unify the behavior, we need to
          // convert it to a BlockSelection
          const node = selection.getNodes()[0]
          if ($isBlock(node)) {
            return editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node })
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection) && selection._blocks.size > 0) {
          const firstBlock = $getNodeByKey(Array.from(selection._blocks)[0]) as BaseBlockNode
          firstBlock.selectPrevious()
          event.preventDefault()
          return true
        } else if ($isRangeSelection(selection)) {
          const previousAdjacentNode = $getAdjacentNode(selection.focus, true)
          if ($isDecoratorBlockNode(previousAdjacentNode)) {
            event.preventDefault()
            previousAdjacentNode.selectEnd()
            return true
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection) && selection._blocks.size > 0) {
          const lastBlock = $getNodeByKey<BaseBlockNode>(Array.from(selection._blocks).pop()!)!
          lastBlock.selectNext()
          event.preventDefault()
          return true
        } else if ($isRangeSelection(selection)) {
          const nextAdjacentNode = $getAdjacentNode(selection.focus, false)
          if ($isDecoratorBlockNode(nextAdjacentNode)) {
            nextAdjacentNode.selectStart()
            event.preventDefault()
            return true
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      // Lexical does not dispatch `SELECT_ALL_COMMAND` in Firefox, so we use `KEY_MODIFIER_COMMAND` instead.
      // See: https://github.com/facebook/lexical/blob/940435d30da0a2f09d5e3eda2e0a1eeb73923554/packages/lexical/src/LexicalEvents.ts#L1117
      KEY_MODIFIER_COMMAND,
      event => {
        if (!isSelectAll(event)) return false
        event.preventDefault()
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            const anchorNode = $getElementNodeAtPoint(selection.anchor)
            if (anchorNode) {
              if (!anchorNode.isEmpty()) {
                selectWholeContent(anchorNode, selection)
                return true
              }
              const block = $findMatchingParent(anchorNode, $isElementBlock)
              if (block) {
                editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: block })
                return true
              }
            }
          } else {
            const anchorBlock = $getBlockElementNodeAtPoint(selection.anchor)
            const focusBlock = $getBlockElementNodeAtPoint(selection.focus)
            if (anchorBlock && focusBlock) {
              if (anchorBlock.__key === focusBlock.__key) {
                if (!$isAtBlockStart(selection.anchor) || !$isAtBlockEnd(selection.focus)) {
                  selectWholeContent(anchorBlock, selection)
                  return true
                } else {
                  const block = $findMatchingParent(anchorBlock, $isElementBlock)
                  if (block) {
                    editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: block })
                    return true
                  }
                }
              } else {
                const commonBlock = $getLowestCommonBlockAncestor(anchorBlock, focusBlock)
                if (commonBlock) {
                  editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: commonBlock })
                  return true
                }
              }
            }
          }
        }

        // Select all blocks
        const rootNode = $getRoot()
        const blockSelection = $createBlockSelection()
        rootNode.getChildren().forEach(node => {
          editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node, selection: blockSelection })
        })
        $setSelection(blockSelection)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* -------------------------------- Deletion -------------------------------- */
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection)) {
          event.preventDefault()
          selection.getNodes().forEach(node => {
            node.selectPrevious()
            node.remove()
          })
          const rootNode = $getRoot()
          if (rootNode.isEmpty()) {
            rootNode.append($createParagraphNode())
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_DELETE_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection)) {
          event.preventDefault()
          selection.getNodes().forEach(node => {
            node.selectNext()
            node.remove()
          })
          const rootNode = $getRoot()
          if (rootNode.isEmpty()) {
            rootNode.append($createParagraphNode())
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* -------------------------------- Insertion ------------------------------- */
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection) && selection._blocks.size > 0) {
          const lastBlock = $getNodeByKey<BaseBlockNode>(Array.from(selection._blocks).pop()!)!
          const paragraph = lastBlock.insertAfter($createParagraphNode())
          paragraph.selectStart()
          event?.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* -------------------------------- Clipboard ------------------------------- */
    editor.registerCommand(
      COPY_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection)) {
          copyToClipboard(
            editor,
            objectKlassEquals(event, ClipboardEvent) ? (event as ClipboardEvent) : null,
            // Since the nodes contained in the selected block are considered unselected,
            // we need to create a NodeSelection and recursively add all the nodes
            $getClipboardDataFromSelection(BlockSelection.$toNodeSelection(selection)),
          )
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand(
      CUT_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isBlockSelection(selection)) {
          const blocks = selection.getNodes()
          copyToClipboard(
            editor,
            objectKlassEquals(event, ClipboardEvent) ? (event as ClipboardEvent) : null,
            $getClipboardDataFromSelection(BlockSelection.$toNodeSelection(selection)),
          ).then(() => {
            editor.update(() => {
              blocks.forEach(block => block.remove())
            })
          })
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW,
    ),
  )
}

function $getLowestCommonBlockAncestor(
  node1: LexicalNode,
  node2: LexicalNode,
): ElementBlock | null {
  const ancestors1 = new Set<ElementBlock>()
  let current: LexicalNode | null = node1
  while (current) {
    if ($isElementBlock(current)) ancestors1.add(current)
    current = current.getParent()
  }

  current = node2
  while (current) {
    if ($isElementBlock(current) && ancestors1.has(current)) return current
    current = current.getParent()
  }

  return null
}

function selectWholeContent(node: ElementNode, selection: RangeSelection) {
  selection.anchor.set(node.__key, 0, "element")
  selection.focus.set(node.__key, node.getChildrenSize(), "element")
  $normalizeSelection__EXPERIMENTAL(selection)
}

function isSelectAll(event: KeyboardEvent) {
  return event.key.toLocaleLowerCase() === "a" && (IS_APPLE ? event.metaKey : event.ctrlKey)
}
