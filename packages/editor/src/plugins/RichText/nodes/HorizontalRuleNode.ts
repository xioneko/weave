import type { NodeMarkdownSerializer } from "#core/markdown"
import { DecoratorBlockNode, type SerializedDecoratorBlockNode } from "#core/nodes"
import HorizontalRuleDecorator from "../Components/HorizontalRuleDecorator.vue"
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
} from "lexical"
import type { FunctionalComponent } from "vue"

export type SerializedHorizontalRuleNode = SerializedDecoratorBlockNode

export class HorizontalRuleNode extends DecoratorBlockNode<typeof HorizontalRuleDecorator> {
  static override getType(): string {
    return "horizontal-rule"
  }

  static override clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  constructor(key?: string) {
    super(key)
  }

  override getTextContent(): string {
    return "\n"
  }

  /* ---------------------------------- View ---------------------------------- */

  override createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = super.createDOM(config, editor, "hr")
    if (config.theme.hr) {
      dom.className = config.theme.hr
    }
    return dom
  }

  override createDecorator(_editor: LexicalEditor, _config: EditorConfig) {
    return {
      component: HorizontalRuleDecorator,
      props: {
        nodeKey: this.__key,
      },
    }
  }

  override decorate(editor: LexicalEditor, config: EditorConfig): FunctionalComponent {
    return super.decorate(editor, config)
  }

  /* ------------------------------ Serialization ----------------------------- */

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    return { element: document.createElement("hr") }
  }

  static override importDOM(): DOMConversionMap {
    return {
      hr: () => ({
        conversion: () => ({
          node: $createHorizontalRuleNode(),
        }),
        priority: 0,
      }),
    }
  }

  override exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: "horizontal-rule",
      version: 1,
    }
  }

  static override importJSON(_serializedNode: SerializedHorizontalRuleNode): LexicalNode {
    return $createHorizontalRuleNode()
  }

  override exportMarkdown: NodeMarkdownSerializer = () => "---"
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return new HorizontalRuleNode()
}
