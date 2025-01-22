import type { EditorPlugin } from "#core/types.ts"
import HistoryPlugin from "./HistoryPlugin.vue"

export default {
  id: "builtin:history",
  component: HistoryPlugin,
} satisfies EditorPlugin
