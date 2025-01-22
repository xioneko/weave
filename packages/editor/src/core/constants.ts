import { ParagraphNode } from "lexical"

export const UpdateTags = {
  // https://github.com/facebook/lexical/blob/8bd22d5339c0dda7e11a3946389258c78a940037/packages/lexical-history/src/index.ts#L318-L372
  historic: "historic",
  // https://github.com/facebook/lexical/blob/b7fa4cf673869dac0c2e0c1fe667e71e72ff6adb/packages/lexical-history/src/index.ts#L266
  historyMerge: "history-merge",
  paste: "paste",
  // https://github.com/facebook/lexical/blob/7de86e4dc9331faaf358c03c46ff07785d9d708a/packages/lexical/src/LexicalUpdates.ts#L612
  skipDomSelection: "skip-dom-selection",
}

export const DefaultNodes = [ParagraphNode]

export { BlockSelectedAttr } from "./nodes/BlockNode"

// https://github.com/facebook/lexical/blob/541fa432854495bb167510cd2157495cdb4bc54b/packages/lexical-clipboard/src/clipboard.ts#L37
export const ClipboardDataFormat = "application/x-lexical-editor"
