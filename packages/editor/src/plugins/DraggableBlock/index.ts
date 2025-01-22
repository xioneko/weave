import type { EditorPlugin } from "#core/types.ts"
import { defineAsyncComponent } from "vue"

export * from "./DraggableBlockPlugin.vue"

export default {
  id: "builtin:draggable-block",
  component: defineAsyncComponent(() => import("./DraggableBlockPlugin.vue")),
} satisfies EditorPlugin
