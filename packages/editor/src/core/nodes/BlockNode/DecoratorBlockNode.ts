import { DecoratorNode } from "../DecoratorNode"
import {
  type BaseBlockNode,
  normalizeBlockDOM,
  $selectPrevious,
  $selectNext,
  updateSelectedAttr,
} from "./BaseBlockNode"
import { $isBlockSelection } from "./BlockSelection"
import { SELECT_BLOCK_COMMAND } from "./registerBlock"
import {
  $getEditor,
  type BaseSelection,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type RangeSelection,
  type SerializedLexicalNode,
} from "lexical"
import type { Constructor } from "type-fest"
import type { ComponentPublicInstance } from "vue"

export type SerializedDecoratorBlockNode = SerializedLexicalNode

export class DecoratorBlockNode<C extends Constructor<ComponentPublicInstance>>
  extends DecoratorNode<C>
  implements BaseBlockNode
{
  __blokSelected: boolean = false

  override isSelected(selection?: null | BaseSelection): boolean {
    if ($isBlockSelection(selection)) {
      return this.__blokSelected
    }
    return super.isSelected(selection)
  }

  override afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode)
    this.__blokSelected = prevNode.__blokSelected
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  override isInline(): false {
    return false
  }

  override createDOM(_config: EditorConfig, editor: LexicalEditor, tag?: string): HTMLElement {
    const dom = super.createDOM(_config, editor, tag)
    updateSelectedAttr(dom, this.__blokSelected)
    return normalizeBlockDOM(dom, editor)
  }

  override updateDOM(_prevNode: this, dom: HTMLElement, _config: EditorConfig): boolean {
    updateSelectedAttr(dom, this.__blokSelected)
    return false
  }

  override selectPrevious(anchorOffset?: number, focusOffset?: number): RangeSelection {
    return $selectPrevious(this, anchorOffset, focusOffset)
  }

  override selectNext(anchorOffset?: number, focusOffset?: number): RangeSelection {
    return $selectNext(this, anchorOffset, focusOffset)
  }

  override selectStart(): RangeSelection {
    const editor = $getEditor()
    editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: this })
    // @ts-expect-error
    return null
  }

  override selectEnd(): RangeSelection {
    const editor = $getEditor()
    editor.dispatchCommand(SELECT_BLOCK_COMMAND, { node: this })
    // @ts-expect-error
    return null
  }
}

export function $isDecoratorBlockNode(
  node: LexicalNode | null | undefined,
): node is DecoratorBlockNode<any> {
  return node instanceof DecoratorBlockNode
}
