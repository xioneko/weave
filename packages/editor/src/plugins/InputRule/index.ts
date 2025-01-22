import type { EditorPlugin } from "#core/types.ts"
import { defineAsyncComponent } from "vue"

export { type InputRule } from "./InputRule"
export type { InputRulePluginApi } from "./InputRulePlugin.vue"

export default {
  id: "builtin:input-rule",
  component: defineAsyncComponent(() => import("./InputRulePlugin.vue")),
} satisfies EditorPlugin
