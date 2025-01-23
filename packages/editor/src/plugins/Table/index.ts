import type { EditorPlugin } from "#core/types.ts"
import TablePlugin from "./TablePlugin.vue"
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "./nodes"

export * from "./nodes"

export default {
  id: "builtin:table",
  component: TablePlugin,
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
