import { $createBlockSelection, SELECT_BLOCK_COMMAND } from "#core/nodes"
import { __warn__ } from "#shared/dev.ts"
import { isUTF8 } from "#shared/utils.ts"
import { IS_APPLE } from "@lexical/utils"
import {
  $getRoot,
  $setSelection,
  COPY_COMMAND,
  CUT_COMMAND,
  PASTE_COMMAND,
  type LexicalEditor,
} from "lexical"

export type ContextMenuItem =
  | {
      type: "item"
      title: string
      keyboardShortcut?: string
      action: (editor: LexicalEditor) => void
    }
  | {
      type: "submenu"
      title: string
      children: ContextMenuItem[]
    }
  | {
      type: "separator"
    }

export function getDefaultContextMenuItems(): ContextMenuItem[] {
  return [
    {
      type: "item",
      title: "Cut",
      keyboardShortcut: IS_APPLE ? "⌘X" : "Ctrl+X",
      action(editor) {
        editor.dispatchCommand(CUT_COMMAND, null)
      },
    },
    {
      type: "item",
      title: "Copy",
      keyboardShortcut: IS_APPLE ? "⌘C" : "Ctrl+C",
      action(editor) {
        editor.dispatchCommand(COPY_COMMAND, null)
      },
    },
    {
      type: "item",
      title: "Paste",
      keyboardShortcut: IS_APPLE ? "⌘V" : "Ctrl+V",
      async action(editor) {
        try {
          const [item] = await navigator.clipboard.read()
          // In Firefox, we cannot directly pass the populated DataTransfer object to the event
          const event = new ClipboardEvent("paste", { clipboardData: new DataTransfer() })
          for (const type of item.types) {
            const blob = await item.getType(type)
            if (await isUTF8(blob)) {
              event.clipboardData!.items.add(await blob.text(), type)
            } else {
              event.clipboardData!.items.add(new File([blob], "file", { type }))
            }
          }
          editor.dispatchCommand(PASTE_COMMAND, event)
        } catch (error) {
          __warn__(undefined, "Failed to paste", error)
        }
      },
    },
    {
      type: "item",
      title: "Paste as Plain Text",
      keyboardShortcut: IS_APPLE ? "⇧⌘V" : "Ctrl+Shift+V",
      async action(editor) {
        try {
          const text = await navigator.clipboard.readText()
          const event = new ClipboardEvent("paste", { clipboardData: new DataTransfer() })
          event.clipboardData!.items.add(text, "text/plain")
          editor.dispatchCommand(PASTE_COMMAND, event)
        } catch (error) {
          __warn__(undefined, "Failed to paste as plain text", error)
        }
      },
    },
    {
      type: "item",
      title: "Select All",
      keyboardShortcut: IS_APPLE ? "⌘A" : "Ctrl+A",
      action(editor) {
        editor.update(() => {
          const rootNode = $getRoot()
          const blockSelection = $createBlockSelection()
          rootNode.getChildren().forEach(node => {
            editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node, selection: blockSelection })
          })
          $setSelection(blockSelection)
        })
      },
    },
  ]
}
