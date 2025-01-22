import type { EditorPlugin } from "#core/types.ts"
import { $createLinkNode, LinkNode } from "./LinkNode"
import { defineAsyncComponent } from "vue"

export default {
  id: "builtin:link",
  component: defineAsyncComponent(() => import("./LinkPlugin.vue")),
  nodes: [LinkNode],
  markdown: {
    tokenParserMap: {
      link: {
        type: "node",
        createNode(token) {
          const url = token.attrGet("href") || undefined
          return $createLinkNode(url)
        },
      },
    },
  },
} satisfies EditorPlugin
