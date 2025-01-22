import type { EditorPlugin } from "#core/types.ts"
import { $createImageBlockNode, ImageBlockNode } from "./ImageBlockNode"
import { defineAsyncComponent } from "vue"

export * from "./ImageBlockNode"

export default {
  id: "builtin:image-block",
  nodes: [ImageBlockNode],
  component: defineAsyncComponent(() => import("./ImageBlockPlugin.vue")),
  markdown: {
    tokenParserMap: {
      image: {
        type: "node",
        createNode(token) {
          const src = token.attrGet("src") || undefined
          return $createImageBlockNode(src)
        },
      },
    },
  },
} satisfies EditorPlugin
