import type { FloatingToolbarPluginApi } from "#plugins/FloatingToolbar"
import { __assert__ } from "#shared/dev.ts"
import { $getElementNodeAtPoint } from "#shared/selection.ts"
import type { FloatingToolbarItem } from "../FloatingToolbar/FloatingToolbarItem"
import { $isLinkNode, $unLink, type LinkNode, $linkify } from "./LinkNode"
import { Toggle } from "@weave/ui/components/Toggle"
import { Link } from "@weave/ui/icons"
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type LexicalEditor,
  type TextNode,
} from "lexical"
import { h, type Ref } from "vue"

export function getLinkToolbarItem(
  isLink: Ref<boolean>,
  editor: LexicalEditor,
  api: FloatingToolbarPluginApi,
  onShowLinkEditor: (link: LinkNode) => void,
): FloatingToolbarItem {
  return {
    id: "Link",
    component: function LinkToggle() {
      return h(
        Toggle,
        {
          modelValue: isLink.value,
          "onUpdate:modelValue": value => {
            isLink.value = value
            if (value) {
              // Create link
              let link: LinkNode | undefined
              editor.update(
                () => {
                  const selection = $getSelection()
                  __assert__($isRangeSelection(selection), "Expected a range selection")
                  const nodes = selection.extract()
                  let start = 0
                  while (start < nodes.length && !$isTextNode(nodes[start])) start++
                  let end = start + 1
                  while (end < nodes.length && $isTextNode(nodes[end])) end++
                  const textNodes = nodes.slice(start, end) as TextNode[]
                  if (textNodes.length > 0) {
                    link = $linkify(textNodes, "https://")
                    api.disable()
                  }
                },
                {
                  onUpdate() {
                    if (link) onShowLinkEditor(link)
                  },
                },
              )
            } else {
              // Unlink
              editor.update(() => {
                const selection = $getSelection()
                __assert__($isRangeSelection(selection), "Expected a range selection")
                const anchor = $getElementNodeAtPoint(selection.anchor)
                const focus = $getElementNodeAtPoint(selection.focus)
                if ($isLinkNode(anchor)) {
                  $unLink(anchor)
                }
                if ($isLinkNode(focus) && focus.__key !== anchor?.__key) {
                  $unLink(focus)
                }
              })
            }
          },
        },
        () => h(Link, { width: "100%", height: "100%" }),
      )
    },
    onUpdate(selection) {
      editor.read(() => {
        const anchor = $getElementNodeAtPoint(selection.anchor)
        const focus = $getElementNodeAtPoint(selection.focus)
        if ($isLinkNode(anchor) || $isLinkNode(focus)) {
          isLink.value = true
        } else {
          isLink.value = false
        }
      })
    },
  }
}
