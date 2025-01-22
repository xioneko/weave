import type { EditorPlugin } from "#core/types.ts"
import { $createCodeBlockNode, CodeBlockNode } from "./CodeBlockNode"
import CodeBlockPlugin from "./CodeBlockPlugin.vue"

export { CodeBlockNode, $isCodeBlockNode, $createCodeBlockNode } from "./CodeBlockNode"

export default {
  id: "builtin:code-block",
  component: CodeBlockPlugin,
  nodes: [CodeBlockNode],
  markdown: {
    tokenParserMap: {
      code_block: {
        type: "node",
        createNode(token) {
          const code = token.content.trimEnd()
          return $createCodeBlockNode(undefined, code)
        },
      },
      fence: {
        type: "node",
        createNode(token) {
          const lang = token.info.trim() || undefined
          const code = token.content.trimEnd()
          return $createCodeBlockNode(lang, code)
        },
      },
    },
  },
} satisfies EditorPlugin
