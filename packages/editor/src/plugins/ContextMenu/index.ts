import type { EditorPlugin } from "#core/types.ts"
import { defineAsyncComponent } from "vue"

export {
  OPEN_CONTEXT_MENU_COMMAND,
  type OpenContextMenuCommandPayload,
} from "./ContextMenuPlugin.vue"

export default {
  id: "builtin:context-menu",
  component: defineAsyncComponent(() => import("./ContextMenuPlugin.vue")),
} satisfies EditorPlugin
