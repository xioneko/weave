import type { EditorPlugin } from "#core/types.ts"
import InputRulePlugin from "./InputRulePlugin.vue"

export { type InputRule } from "./InputRule"
export type { InputRulePluginApi } from "./InputRulePlugin.vue"

export default {
  id: "builtin:input-rule",
  component: InputRulePlugin,
} satisfies EditorPlugin
