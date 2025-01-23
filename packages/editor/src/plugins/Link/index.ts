import type { EditorPlugin } from "#core/types.ts"
import { $createLinkNode, LinkNode } from "./LinkNode"
import LinkPlugin from "./LinkPlugin.vue"

export default {
  id: "builtin:link",
  component: LinkPlugin,
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
