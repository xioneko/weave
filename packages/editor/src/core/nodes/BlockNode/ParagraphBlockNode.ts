import {
  type BaseBlockNode,
  normalizeBlockDOM,
  $selectPrevious,
  $selectNext,
  updateSelectedAttr,
} from "./BaseBlockNode"
import { $isBlockSelection } from "./BlockSelection"
import {
  ParagraphNode,
  type BaseSelection,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type RangeSelection,
  type SerializedParagraphNode,
} from "lexical"

export class ParagraphBlockNode extends ParagraphNode implements BaseBlockNode {
  __blokSelected: boolean = false

  static override getType(): string {
    return "paragraph-block"
  }

  static override clone(node: ParagraphNode): ParagraphBlockNode {
    return new ParagraphBlockNode(node.__key)
  }

  override afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode)
    this.__blokSelected = prevNode.__blokSelected
  }

  constructor(key?: string) {
    super(key)
  }

  override isSelected(selection?: null | BaseSelection): boolean {
    if ($isBlockSelection(selection)) {
      return this.__blokSelected
    }
    return super.isSelected(selection)
  }

  override isInline(): false {
    return false
  }

  override canIndent(): boolean {
    return false
  }

  // @ts-expect-error - Though `editor` param doesn't exist in the parent class, it will be always passed
  override createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement("p")
    if (config.theme.paragraph) {
      dom.className = config.theme.paragraph
    }
    updateSelectedAttr(dom, this.__blokSelected)
    return normalizeBlockDOM(dom, editor)
  }

  override updateDOM(_prevNode: ParagraphNode, dom: HTMLElement, _config: EditorConfig): boolean {
    updateSelectedAttr(dom, this.__blokSelected)
    return false
  }

  override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const p = document.createElement("p")
    if (this.isEmpty()) [p.appendChild(document.createElement("br"))]
    return { element: p }
  }

  static override importDOM(): DOMConversionMap | null {
    return ParagraphNode.importDOM()
  }

  override exportJSON(): SerializedParagraphNode {
    return {
      ...super.exportJSON(),
      type: ParagraphBlockNode.getType(),
    }
  }

  static override importJSON(serializedNode: SerializedParagraphNode): ParagraphBlockNode {
    return new ParagraphBlockNode().updateFromJSON(serializedNode)
  }

  override selectPrevious(anchorOffset?: number, focusOffset?: number): RangeSelection {
    return $selectPrevious(this, anchorOffset, focusOffset)
  }

  override selectNext(anchorOffset?: number, focusOffset?: number): RangeSelection {
    return $selectNext(this, anchorOffset, focusOffset)
  }
}
