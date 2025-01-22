import { $warpContinuosInlineNodes } from "#shared/node.ts"
import {
  $createParagraphNode,
  $isElementNode,
  isInlineDomNode,
  type DOMChildConversion,
  type DOMConversion,
  type DOMConversionFn,
  type LexicalEditor,
  type LexicalNode,
} from "lexical"

export function $importFromDOM(editor: LexicalEditor, dom: Node): LexicalNode[] {
  return $convertDOM(dom, editor)
}

function $convertDOM(
  domNode: Node,
  editor: LexicalEditor,
  parent?: LexicalNode | null,
  childConversions: DOMChildConversion[] = [],
): LexicalNode[] {
  if (domNode.nodeName === "SCRIPT" || domNode.nodeName === "STYLE") {
    return []
  }

  const nodes: LexicalNode[] = []
  let currentNode: LexicalNode | undefined | null

  const conversion = getConversionFn(domNode, editor)
  const output = conversion?.(domNode as HTMLElement)

  if (output?.node) {
    // If conversion function returns multiple nodes, we will only use the last one as the parent (if it's an ElementNode).
    currentNode = Array.isArray(output.node) ? output.node[output.node.length - 1] : output.node
    for (let i = 0; i < childConversions.length; ++i) {
      currentNode = childConversions[i](currentNode, parent)
      if (!currentNode) break
    }
    // If any child conversion (`forChild`) returns null, we will ignore the output.
    if (currentNode) {
      if (Array.isArray(output.node)) {
        nodes.push(...output.node)
      } else {
        nodes.push(currentNode)
      }
    }
  }

  if (currentNode && !$isElementNode(currentNode)) {
    // If currentNode cannot have children, we will ignore the child nodes of the DOM node.
    return nodes
  }

  if (output?.forChild) {
    childConversions = [...childConversions, output.forChild]
  }

  let childNodes: LexicalNode[] = []
  const domNodes = domNode.childNodes
  for (let i = 0; i < domNodes.length; ++i) {
    childNodes.push(...$convertDOM(domNodes[i], editor, currentNode, childConversions))
  }

  if (output?.after) {
    childNodes = output.after(childNodes)
  }

  if (currentNode) {
    currentNode.append(...childNodes)
  } else if (
    // If conversion function returns null explicitly
    output === null ||
    isInlineDomNode(domNode)
  ) {
    // flattening the child nodes
    return childNodes
  } else {
    // The continuous inline nodes will be wrapped into a paragraph node.
    nodes.push(...$warpContinuosInlineNodes(childNodes, $createParagraphNode))
  }

  return nodes
}

function getConversionFn(domNode: Node, editor: LexicalEditor): DOMConversionFn | undefined {
  const conversions = editor._htmlConversions.get(domNode.nodeName.toLowerCase())
  let result: DOMConversion | undefined
  if (conversions) {
    for (let i = 0; i < conversions.length; ++i) {
      const domConversion = conversions[i](domNode)
      if (domConversion && (domConversion.priority ?? 0) >= (result?.priority ?? 0)) {
        result = domConversion
      }
    }
  }
  return result?.conversion
}
