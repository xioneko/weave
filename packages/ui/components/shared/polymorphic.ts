import {
  cloneVNode,
  defineComponent,
  Fragment,
  h,
  type ComponentPublicInstance,
  type IntrinsicElementAttributes,
  type VNode,
  type VNodeProps,
} from 'vue'

const Tags = [
  'a',
  'button',
  'div',
  'form',
  'h2',
  'h3',
  'img',
  'input',
  'label',
  'li',
  'nav',
  'ol',
  'p',
  'span',
  'svg',
  'ul',
] as const

type ElementType = (keyof IntrinsicElementAttributes & keyof HTMLElementTagNameMap) | 'svg'

export type PolymorphicProps<E extends ElementType> = IntrinsicElementAttributes[E] & {
  /**
   * @note this prop should be stable
   */
  asChild?: boolean
}

export type PolymorphicElement<E extends ElementType> = Omit<
  ComponentPublicInstance<VNodeProps & PolymorphicProps<E>>,
  '$el'
> & { $el: E extends 'svg' ? SVGElement : HTMLElement }

type PolymorphicElements = {
  [T in (typeof Tags)[number]]: new () => PolymorphicElement<T>
}

export const el = Tags.reduce((acc, tag) => {
  const Component = defineComponent({
    name: `el.${tag}`,
    inheritAttrs: false,
    props: {
      asChild: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { slots, attrs }) {
      if (props.asChild) {
        return () => h(AsChild, attrs, { default: slots.default })
      }
      if (['input', 'img'].includes(tag)) {
        return () => h(tag, attrs)
      }
      return () => h(tag, attrs, { default: slots.default })
    },
  })
  return { ...acc, [tag]: Component }
}, {} as PolymorphicElements)

export default el

export const AsChild = defineComponent({
  name: 'AsChild',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    // children nodes should not be created synchronously in setup function
    return () => {
      let children = slots.default?.()
      if (!children || children.length !== 1 || isPrimitiveNode(children[0])) {
        throw new Error('AsChild: Must provide exactly one non-primitive child')
      }
      let child = children[0]
      if (child.type === Fragment) {
        // dealing with the case where the child is a <template> or <slot>
        if (child.children!.length !== 1 || isPrimitiveNode((child.children as VNode[])[0]))
          throw new Error('AsChild: Fragment must have exactly one non-primitive child')
        child = (child.children as VNode[])[0]
      }

      return cloneVNode(child, attrs)
    }
  },
})

function isPrimitiveNode(node: VNode) {
  return node.type === Text || node.type === Comment
}
