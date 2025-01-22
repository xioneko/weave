import { $linkify } from "./LinkNode"
import { objectKlassEquals } from "@lexical/utils"
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
  type LexicalEditor,
  type TextNode,
} from "lexical"

const UrlRegExp =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/

export function registerLink(editor: LexicalEditor) {
  return editor.registerCommand(
    PASTE_COMMAND,
    event => {
      if (objectKlassEquals(event, ClipboardEvent)) {
        const selection = $getSelection()
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          const data = (event as ClipboardEvent).clipboardData
          if (data) {
            const url = data.getData("text/plain")
            if (url === "https://" || UrlRegExp.test(url)) {
              const nodes = selection.getNodes()
              if (nodes.every($isTextNode)) {
                $linkify(selection.extract() as TextNode[], url)
                event.preventDefault()
                return true
              }
            }
          }
        }
      }
      return false
    },
    COMMAND_PRIORITY_LOW,
  )
}
