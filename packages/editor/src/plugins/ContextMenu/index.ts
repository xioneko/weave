import type { EditorPlugin } from "#core/types.ts"
import ContextMenuPlugin from "./ContextMenuPlugin.vue"

export {
  OPEN_CONTEXT_MENU_COMMAND,
  type OpenContextMenuCommandPayload,
} from "./ContextMenuPlugin.vue"

export default {
  id: "builtin:context-menu",
  component: ContextMenuPlugin,
} satisfies EditorPlugin
