import type { EditorPlugin } from "#core/types.ts"
import FloatingToolbarPlugin from "./FloatingToolbarPlugin.vue"

export { type FloatingToolbarPluginApi } from "./FloatingToolbarPlugin.vue"

export default {
  id: "builtin:floating-toolbar",
  component: FloatingToolbarPlugin,
} satisfies EditorPlugin
