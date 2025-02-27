import { ClipboardDataFormat, UpdateTags } from "#core/constants.ts"
import { $importFromDOM } from "#core/importDOM.ts"
import { $isElementBlock, $isElementWithinDecorator } from "#core/nodes"
import { __warn__ } from "#shared/dev.ts"
import { caretFromPoint } from "#shared/dom.ts"
import { $getBlockIfAtBlockStart } from "#shared/selection.ts"
import {
  $generateNodesFromSerializedNodes,
  $insertGeneratedNodes,
  copyToClipboard,
} from "@lexical/clipboard"
import { $findMatchingParent, IS_FIREFOX, mergeRegister, objectKlassEquals } from "@lexical/utils"
import {
  $createLineBreakNode,
  $createRangeSelection,
  $createTabNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $insertNodes,
  $isBlockElementNode,
  $isNodeSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  $normalizeSelection__EXPERIMENTAL,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  COPY_COMMAND,
  createCommand,
  CUT_COMMAND,
  DELETE_CHARACTER_COMMAND,
  DELETE_LINE_COMMAND,
  DELETE_WORD_COMMAND,
  DROP_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  INSERT_TAB_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  PASTE_COMMAND,
  REMOVE_TEXT_COMMAND,
  type BaseSelection,
  type ElementFormatType,
  type ElementNode,
  type LexicalCommand,
  type LexicalEditor,
  type LexicalNode,
  type RangeSelection,
  type TextFormatType,
} from "lexical"

export const DROP_PASTE_FILE_COMMAND: LexicalCommand<File[]> =
  createCommand("DROP_PASTE_FILE_COMMAND")

export function registerRichText(editor: LexicalEditor) {
  return mergeRegister(
    /* -------------------------------- Text Edit ------------------------------- */
    editor.registerCommand(
      DELETE_CHARACTER_COMMAND,
      isBackward => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false
        selection.deleteCharacter(isBackward)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),

    editor.registerCommand<boolean>(
      DELETE_WORD_COMMAND,
      isBackward => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        selection.deleteWord(isBackward)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<boolean>(
      DELETE_LINE_COMMAND,
      isBackward => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        selection.deleteLine(isBackward)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      eventOrText => {
        const selection = $getSelection()
        if (typeof eventOrText === "string") {
          if (selection !== null) {
            selection.insertText(eventOrText)
          }
        } else {
          if (selection === null) {
            return false
          }

          const dataTransfer = eventOrText.dataTransfer
          if (dataTransfer != null) {
            $insertDataTransfer(dataTransfer, selection, editor)
            return true
          } else if ($isRangeSelection(selection)) {
            const data = eventOrText.data
            if (data) {
              selection.insertText(data)
            }
            return true
          }
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      REMOVE_TEXT_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          if (IS_FIREFOX && event?.inputType === "deleteByDrag") {
            // In Firefox, we need to delay the removal of dragged text to avoid selection change.
            // If we remove the text immediately, the position where the text is dropped will always
            // be the same as where it is dragged from.
            window.setTimeout(() => {
              editor.update(() => selection.removeText(), { tag: UpdateTags.skipDomSelection })
            })
          } else {
            selection.removeText()
          }
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* --------------------------------- Format --------------------------------- */
    editor.registerCommand<TextFormatType>(
      FORMAT_TEXT_COMMAND,
      format => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        selection.formatText(format)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<ElementFormatType>(
      FORMAT_ELEMENT_COMMAND,
      format => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          return false
        }
        const nodes = selection.getNodes()
        for (const node of nodes) {
          const element = $findMatchingParent(node, $isBlockElementNode)
          if (element !== null) {
            element.setFormat(format)
          }
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* --------------------------- Insert Basic Nodes --------------------------- */
    editor.registerCommand<boolean>(
      INSERT_LINE_BREAK_COMMAND,
      selectStart => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        selection.insertLineBreak(selectStart)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return false
        }
        selection.insertParagraph()
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_TAB_COMMAND,
      () => {
        $insertNodes([$createTabNode()])
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* -------------------------------- Clipboard ------------------------------- */
    editor.registerCommand(
      COPY_COMMAND,
      event => {
        copyToClipboard(
          editor,
          objectKlassEquals(event, ClipboardEvent) ? (event as ClipboardEvent) : null,
        )
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CUT_COMMAND,
      event => {
        copyToClipboard(editor, event instanceof ClipboardEvent ? event : null).then(() => {
          editor.update(() => {
            const selection = $getSelection()
            if (selection) {
              if ($isRangeSelection(selection)) {
                selection.removeText()
              } else {
                selection.getNodes().forEach(node => node.remove())
              }
            }
          })
        })
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      PASTE_COMMAND,
      event => {
        if (event.target instanceof Node && $isElementWithinDecorator(event.target)) return false
        const dataTransfer =
          (event as ClipboardEvent).clipboardData ?? (event as InputEvent).dataTransfer
        if (dataTransfer) {
          const types = dataTransfer.types
          if (types.includes("text/html") || types.includes("text/plain")) {
            const selection = $getSelection()
            if (selection !== null) {
              event.preventDefault()
              editor.update(() => $insertDataTransfer(dataTransfer, selection, editor), {
                tag: UpdateTags.paste,
              })
              return true
            }
          } else if (types.includes("Files")) {
            const files = Array.from(dataTransfer.files)
            if (files.length > 0) {
              return editor.dispatchCommand(DROP_PASTE_FILE_COMMAND, files)
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* ---------------------------------- Drop ---------------------------------- */
    editor.registerCommand(
      DROP_COMMAND,
      event => {
        const dataTransfer = event.dataTransfer
        if (dataTransfer) {
          const files = Array.from(dataTransfer.files)
          if (files.length > 0) {
            event.preventDefault()
            const caret = caretFromPoint(event.clientX, event.clientY)
            if (caret) {
              const node = $getNearestNodeFromDOMNode(caret.node)
              if (node) {
                const selection = $createRangeSelection()
                if ($isTextNode(node)) {
                  selection.anchor.set(node.__key, caret.offset, "text")
                  selection.focus.set(node.__key, caret.offset, "text")
                } else {
                  const parent = node.getParentOrThrow()
                  if ($isRootNode(parent)) {
                    selection.anchor.set(node.__key, 0, "element")
                    selection.focus.set(node.__key, 0, "element")
                  } else {
                    const offset = node.getIndexWithinParent() + 1
                    selection.anchor.set(parent.__key, offset, "element")
                    selection.focus.set(parent.__key, offset, "element")
                  }
                }
                $setSelection($normalizeSelection__EXPERIMENTAL(selection))
              }
              return editor.dispatchCommand(DROP_PASTE_FILE_COMMAND, files)
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    /* ---------------------------- Indent & Outdent ---------------------------- */
    editor.registerCommand(
      INDENT_CONTENT_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false
        const blocks = $getBlocksThatCanBeIndented(selection)
        blocks.forEach(block => {
          const indent = block.getIndent()
          block.setIndent(indent + 1)
        })
        return blocks.length > 0
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      OUTDENT_CONTENT_COMMAND,
      () => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false
        const blocks = $getBlocksThatCanBeIndented(selection)
        blocks.forEach(block => {
          const indent = block.getIndent()
          if (indent > 0) {
            block.setIndent(indent - 1)
          }
        })
        return blocks.length > 0
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_TAB_COMMAND,
      event => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return false
        event.preventDefault()
        if (event.shiftKey) {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
        } else {
          editor.dispatchCommand(
            $indentOverTab(selection) ? INDENT_CONTENT_COMMAND : INSERT_TAB_COMMAND,
            undefined,
          )
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      event => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const node = $getBlockIfAtBlockStart(selection.anchor)
          if (node) {
            if (node.canIndent()) {
              // Outdent
              const indent = node.getIndent()
              if (indent > 0) {
                node.setIndent(indent - 1)
                event.preventDefault()
                return true
              }
            } else if (!$isParagraphNode(node)) {
              node.collapseAtStart(selection)
              event.preventDefault()
              return true
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR,
    ),
  )
}

function $getBlocksThatCanBeIndented(selection: RangeSelection): ElementNode[] {
  const nodes = selection.getNodes()
  const blocks: ElementNode[] = []
  const visited = new Set<ElementNode>()
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nearestBlock = $findMatchingParent(node, $isElementBlock)
    if (nearestBlock === null || visited.has(nearestBlock) || !nearestBlock.canIndent()) {
      continue
    }
    visited.add(nearestBlock)
    blocks.push(nearestBlock)
  }
  return blocks
}

function $indentOverTab(selection: RangeSelection): boolean {
  const nodes = selection.getNodes()
  // At least one block element can be indented
  if (nodes.some(node => $isElementBlock(node) && node.canIndent())) {
    return true
  }

  // focus or anchor is at the start of the block that can be indented
  const anchor = selection.anchor
  const focus = selection.focus
  const front = anchor.isBefore(focus) ? anchor : focus
  const node = $getBlockIfAtBlockStart(front)
  if (node && node.canIndent()) return true

  return false
}

function $insertDataTransfer(
  dataTransfer: DataTransfer,
  selection: BaseSelection,
  editor: LexicalEditor,
): void {
  const lexicalString = dataTransfer.getData(ClipboardDataFormat)
  if (lexicalString) {
    try {
      const payload = JSON.parse(lexicalString)
      if (payload.namespace === editor._config.namespace && Array.isArray(payload.nodes)) {
        const nodes = $generateNodesFromSerializedNodes(payload.nodes)
        return $insertGeneratedNodes(editor, nodes, selection)
      }
    } catch (error) {
      __warn__(
        $insertDataTransfer,
        `Failed to insert data from format "${ClipboardDataFormat}"`,
        error,
      )
    }
  }

  const htmlString = dataTransfer.getData("text/html")
  if (htmlString) {
    try {
      const parser = new DOMParser()
      const dom = parser.parseFromString(htmlString, "text/html")
      const nodes = $importFromDOM(editor, dom.body)
      return $insertGeneratedNodes(editor, nodes, selection)
    } catch (error) {
      __warn__($insertDataTransfer, "Failed to insert data from HTML", error)
    }
  }

  const text = dataTransfer.getData("text/plain") || dataTransfer.getData("text/uri-list")
  if (text) {
    const parts = text.split(/(\r?\n|\t)/)
    const nodes: LexicalNode[] = []
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part === "\n" || part === "\r\n") {
        nodes.push($createLineBreakNode())
      } else if (part === "\t") {
        nodes.push($createTabNode())
      } else {
        nodes.push($createTextNode(part))
      }
    }
    $insertGeneratedNodes(editor, nodes, selection)
  }
}
