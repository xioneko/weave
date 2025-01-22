import type { EditorPlugin } from "#core/types.ts"
import { ListItemNode, ListNode, ListParagraphNode } from "./nodes"
import { defineAsyncComponent } from "vue"

export * from "./nodes"

export { CheckboxClickableAreaWidth } from "./ListPlugin.vue"

export default {
  id: "builtin:list",
  nodes: [ListNode, ListItemNode, ListParagraphNode],
  component: defineAsyncComponent(() => import("./ListPlugin.vue")),
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
