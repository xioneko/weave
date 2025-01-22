import type { EditorPlugin } from "#core/types.ts"
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "./nodes"
import { defineAsyncComponent } from "vue"

export * from "./nodes"

export default {
  id: "builtin:table",
  component: defineAsyncComponent(() => import("./TablePlugin.vue")),
  nodes: [TableNode, TableRowNode, TableCellNode],
  markdown: {
    tokenParserMap: {
      table: {
        type: "node",
        createNode() {
          return $createTableNode()
        },
      },
      thead: {
        type: "node",
        createNode() {
          return null
        },
      },
      tr: {
        type: "node",
        createNode() {
          return $createTableRowNode()
        },
      },
      th: {
        type: "node",
        createNode() {
          return $createTableCellNode()
        },
      },
      tbody: {
        type: "node",
        createNode() {
          return null
        },
      },
      td: {
        type: "node",
        createNode() {
          return $createTableCellNode()
        },
      },
    },
  },
} satisfies EditorPlugin
