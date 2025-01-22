import type { EditorPlugin } from "#core/types.ts"
import { defineAsyncComponent } from "vue"

export { type FloatingToolbarPluginApi } from "./FloatingToolbarPlugin.vue"

export default {
  id: "builtin:floating-toolbar",
  component: defineAsyncComponent(() => import("./FloatingToolbarPlugin.vue")),
} satisfies EditorPlugin
