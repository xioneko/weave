import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { indentOnInput, indentUnit } from "@codemirror/language"
import { Extension } from "@codemirror/state"
import { keymap } from "@codemirror/view"

export interface BasicSetupInitialOptions {
  tabSize?: number
}

export function basicSetup({ tabSize = 2 }: BasicSetupInitialOptions = {}): Extension[] {
  return [
    history(),
    indentOnInput(),
    closeBrackets(),
    indentUnit.of(" ".repeat(tabSize)),
    keymap.of([...closeBracketsKeymap, ...defaultKeymap, indentWithTab, ...historyKeymap]),
  ]
}
