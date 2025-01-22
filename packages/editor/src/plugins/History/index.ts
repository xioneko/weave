import type { EditorPlugin } from "#core/types.ts"
import { defineAsyncComponent } from "vue"

export default {
  id: "builtin:history",
  component: defineAsyncComponent(() => import("./HistoryPlugin.vue")),
} satisfies EditorPlugin
