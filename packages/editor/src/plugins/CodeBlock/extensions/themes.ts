import { Compartment, type Extension } from "@codemirror/state"
import type { EditorView } from "@codemirror/view"
import { vscodeDarkInit, vscodeLightInit } from "@uiw/codemirror-theme-vscode"

export const themeConf = new Compartment()

export interface ThemeInitialOptions {
  mode: "light" | "dark"
}

// TODO: Add more themes

export function themes({ mode }: ThemeInitialOptions): Extension {
  return themeConf.of([mode === "light" ? vscodeLight : vscodeDark])
}

interface ThemeOptions {
  mode: "light" | "dark"
}

export function changeTheme(view: EditorView, { mode }: ThemeOptions): void {
  view.dispatch({
    effects: themeConf.reconfigure(mode === "light" ? vscodeLight : vscodeDark),
  })
}

const vscodeLight = vscodeLightInit({
  settings: {
    background: "#F7F7F6",
  },
})

const vscodeDark = vscodeDarkInit({
  settings: {
    foreground: "#d4d4d4",
    background: "#17181A",
  },
})
