import type { EditorPlugin } from "../../core/types"
import { defineAsyncComponent } from "vue"

export { type SlashMenuPluginApi } from "./SlashMenuPlugin.vue"
export type { SlashMenuItem } from "./SlashMenuItem"

export default {
  id: "builtin:slash-menu",
  component: defineAsyncComponent(() => import("./SlashMenuPlugin.vue")),
} satisfies EditorPlugin
