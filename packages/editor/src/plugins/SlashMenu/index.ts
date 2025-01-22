import type { EditorPlugin } from "../../core/types"
import SlashMenuPlugin from "./SlashMenuPlugin.vue"

export { type SlashMenuPluginApi } from "./SlashMenuPlugin.vue"
export type { SlashMenuItem } from "./SlashMenuItem"

export default {
  id: "builtin:slash-menu",
  component: SlashMenuPlugin,
} satisfies EditorPlugin
