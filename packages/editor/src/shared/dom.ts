// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace#whitespace_helper_functions
export function isIgnorableDomNode(node: Node) {
  return (
    node.nodeType === 8 || // a comment node
    (node.nodeType === 3 && isAllWs(node))
  ) // a text node, all ws
}

function isAllWs(node: Node) {
  return !/[^\t\n\r ]/.test(node.textContent || "")
}

// Reference: https://github.com/facebook/lexical/blob/7de86e4dc9331faaf358c03c46ff07785d9d708a/packages/shared/src/caretFromPoint.ts#L9
export function caretFromPoint(
  x: number,
  y: number,
): null | {
  offset: number
  node: Node
} {
  if (typeof document.caretRangeFromPoint !== "undefined") {
    const range = document.caretRangeFromPoint(x, y)
    if (range === null) {
      return null
    }
    return {
      node: range.startContainer,
      offset: range.startOffset,
    }
  } else if (typeof document.caretPositionFromPoint !== "undefined") {
    const range = document.caretPositionFromPoint(x, y)
    if (range === null) {
      return null
    }
    return {
      node: range.offsetNode,
      offset: range.offset,
    }
  } else {
    return null
  }
}
