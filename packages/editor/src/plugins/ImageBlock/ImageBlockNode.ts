import type { NodeMarkdownSerializer } from "#core/markdown"
import { type SerializedDecoratorBlockNode, DecoratorBlockNode } from "#core/nodes"
import ImageBlockDecorator, {
  type ImageBlockDecoratorProps,
} from "./components/ImageBlockDecorator.vue"
import {
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type NodeKey,
  type Spread,
} from "lexical"
import { type FunctionalComponent } from "vue"

export type SerializedImageBlockNode = Spread<
  {
    width?: number
    src?: string
  },
  SerializedDecoratorBlockNode
>

export class ImageBlockNode extends DecoratorBlockNode<typeof ImageBlockDecorator> {
  __src?: string
  __width?: number

  static override getType(): string {
    return "image-block"
  }

  static override clone(node: ImageBlockNode): ImageBlockNode {
    return new ImageBlockNode(node.__src, node.__width, node.__key)
  }

  constructor(src?: string, width?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__width = width
  }

  getSrc(): string | undefined {
    return this.__src
  }

  getWidth(): number | undefined {
    const self = this.getLatest()
    return self.__width
  }

  setWidth(width?: number): this {
    const self = this.getWritable()
    self.__width = width
    return this
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor)
    if (config.theme.image) {
      dom.className = config.theme.image
    }
    return dom
  }

  override createDecorator(_editor: LexicalEditor, _config: EditorConfig) {
    return {
      component: ImageBlockDecorator,
      props: {
        nodeKey: this.__key,
        src: this.__src,
        width: this.__width,
      },
    }
  }

  override updateDecorator(
    _editor: LexicalEditor,
    _config: EditorConfig,
    props: ImageBlockDecoratorProps,
  ): boolean {
    props.width = this.__width
    return false
  }

  override decorate(editor: LexicalEditor, config: EditorConfig): FunctionalComponent {
    return super.decorate(editor, config)
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportJSON(): SerializedImageBlockNode {
    return {
      type: ImageBlockNode.getType(),
      version: 1,
      src: this.__src,
      width: this.__width,
    }
  }

  static override importJSON(serializedNode: SerializedImageBlockNode): ImageBlockNode {
    return $createImageBlockNode(serializedNode.src, serializedNode.width)
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("img")
    if (this.__src) element.src = this.__src
    if (this.__width) element.width = this.__width
    return { element }
  }

  static override importDOM(): DOMConversionMap {
    return {
      img: () => {
        return {
          conversion(element) {
            const img = element as HTMLImageElement
            const src = img.getAttribute("src") || ""
            const width = img.width || undefined
            return { node: new ImageBlockNode(src, width) }
          },
          priority: 0,
        }
      },
    }
  }

  override exportMarkdown: NodeMarkdownSerializer = () => {
    return `![${this.__src}](${this.__src})\n`
  }
}

export function $createImageBlockNode(src?: string, width?: number): ImageBlockNode {
  return new ImageBlockNode(src, width)
}

export function $isImageBlockNode(node: unknown): node is ImageBlockNode {
  return node instanceof ImageBlockNode
}
