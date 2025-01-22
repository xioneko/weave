import type { EditorPlugin } from "#core/types.ts"
import DraggableBlockPlugin from "./DraggableBlockPlugin.vue"

export * from "./DraggableBlockPlugin.vue"

export default {
  id: "builtin:draggable-block",
  component: DraggableBlockPlugin,
} satisfies EditorPlugin
