import type { EditorPlugin } from "#core/types.ts"
import ListPlugin from "./ListPlugin.vue"
import { ListItemNode, ListNode, ListParagraphNode } from "./nodes"

export * from "./nodes"

export { CheckboxClickableAreaWidth } from "./ListPlugin.vue"

export default {
  id: "builtin:list",
  nodes: [ListNode, ListItemNode, ListParagraphNode],
  component: ListPlugin,
  markdown: {
    tokenParserMap: {
      list_item: {
        type: "node",
        createNode() {
          return new ListItemNode()
        },
      },
      bullet_list: {
        type: "node",
        createNode() {
          return new ListNode("bullet")
        },
      },
      ordered_list: {
        type: "node",
        createNode(token) {
          const start = +token.attrGet("start")! || 1
          return new ListNode("number", start)
        },
      },
    },
  },
} satisfies EditorPlugin
