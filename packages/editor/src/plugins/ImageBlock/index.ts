import type { EditorPlugin } from "#core/types.ts"
import { $createImageBlockNode, ImageBlockNode } from "./ImageBlockNode"
import ImageBlockPlugin from "./ImageBlockPlugin.vue"

export * from "./ImageBlockNode"

export default {
  id: "builtin:image-block",
  nodes: [ImageBlockNode],
  component: ImageBlockPlugin,
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
