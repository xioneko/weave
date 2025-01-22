import type { NodeKey } from "lexical"
import { useComposerContext } from "./EditorComposer.vue"
import {
  computed,
  VNode,
  h,
  Teleport,
  defineComponent, type PropType,
  type Component
} from "vue"

export default defineComponent({
  name: "DecoratorTeleports",
  inheritAttrs: false,
  props: {
    decorators: {
      type: Object as PropType<Record<NodeKey, Component>>,
      required: true,
    },
  },
  setup(props) {
    const { editor } = useComposerContext()

    const teleports = computed(() => {
      const teleports: VNode[] = []
      Object.entries(props.decorators).forEach(([nodeKey, decorator]) => {
        const element = editor.getElementByKey(nodeKey)
        if (element) {
          teleports.push(h(Teleport, { to: element, key: nodeKey }, h(decorator)))
        }
      })
      return teleports
    })

    return () => teleports.value
  },
})
