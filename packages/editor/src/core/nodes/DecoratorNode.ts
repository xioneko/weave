import {
  $getEditor,
  DecoratorNode as LexicalDecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
} from "lexical"
import type { Constructor } from "type-fest"
import {
  h,
  reactive,
  type ComponentPublicInstance,
  type FunctionalComponent,
  type Reactive,
  type VNodeRef,
} from "vue"
import type { ComponentProps } from "vue-component-type-helpers"

export type Decorator<C extends Constructor<ComponentPublicInstance>> = {
  component: C
  props: ComponentProps<C>
}

export class DecoratorNode<
  C extends Constructor<ComponentPublicInstance>,
> extends LexicalDecoratorNode<FunctionalComponent> {
  __decorator: {
    props: Reactive<ComponentProps<C>>
    component: FunctionalComponent
    instance: InstanceType<C> | null
    dirty: boolean
  } | null = null

  constructor(key?: NodeKey) {
    super(key)
  }

  override afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode)
    this.__decorator = prevNode.__decorator
  }

  override createDOM(_config: EditorConfig, editor: LexicalEditor, tag?: string): HTMLElement {
    const dom = document.createElement(tag ?? "div")
    const key = editor.getKey()
    // @ts-expect-error
    dom[`__decorator_${key}`] = true

    // If the DOM is recreated, the decorator should be recreated as well
    if (this.__decorator) this.__decorator.dirty = true

    return dom
  }

  override updateDOM(_prevNode: this, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false
  }

  createDecorator(_editor: LexicalEditor, _config: EditorConfig): Decorator<C> {
    throw new Error("Method not implemented.")
  }

  /**
   * Return `true` will cause the decorator to be recreated.
   */
  updateDecorator(
    _editor: LexicalEditor,
    _config: EditorConfig,
    _props: Reactive<ComponentProps<C>>,
  ): boolean {
    return false
  }

  override decorate(editor: LexicalEditor, config: EditorConfig): FunctionalComponent {
    if (
      this.__decorator &&
      !this.__decorator.dirty &&
      !this.updateDecorator(editor, config, this.__decorator.props)
    ) {
      return this.__decorator.component
    } else {
      const decorator = this.createDecorator(editor, config)
      const props = reactive(
        Object.assign(decorator.props, {
          ref: ((instance: InstanceType<C> | null) => {
            if (instance) {
              editor.update(() => {
                this.getWritable().__decorator!.instance = instance
              })
            }
          }) as VNodeRef,
        }),
      )
      const component = () => h(decorator.component, props)
      editor.update(() => {
        this.getWritable().__decorator = { component, props, instance: null, dirty: false }
      })
      return component
    }
  }

  getInstance(): InstanceType<C> | null {
    return this.getLatest().__decorator?.instance ?? null
  }
}

export function $isDecoratorNode(node: LexicalNode | null | undefined): node is DecoratorNode<any> {
  return node instanceof DecoratorNode
}

export function $isNodeWithinDecorator(domNode: Node): boolean {
  let node: Node | null | undefined = domNode
  const editor = $getEditor()
  const editorKey = editor.getKey()
  const decoratorKey = `__decorator_${editorKey}`
  const root = editor.getRootElement()
  while (node && node !== root) {
    // @ts-expect-error
    if (node[decoratorKey]) return true
    node = node.parentElement
  }
  return false
}
