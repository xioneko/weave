import { type LanguageDescription } from "@codemirror/language"
import { languages as languageData } from "@codemirror/language-data"
import { Compartment, type Extension } from "@codemirror/state"
import { EditorView } from "@codemirror/view"

export const languageConf = new Compartment()

export type CodeLanguage = LanguageDescription | typeof PLAIN_TEXT

export interface LanguageInitialOptions {
  language?: CodeLanguage
}

export function languages(
  view: EditorView | (() => EditorView),
  { language }: LanguageInitialOptions,
): Extension {
  if (!language || isPlainText(language)) return languageConf.of([])

  if (!language.support) {
    language.load().then(support => {
      const editorView = typeof view === "function" ? view() : view
      editorView.dispatch({
        effects: languageConf.reconfigure(support),
      })
    })
    return languageConf.of([])
  }
  return languageConf.of(language.support)
}

export const PLAIN_TEXT = {
  name: "PlainText",
  alias: ["PlainText"],
}
const isPlainText = (lang: { name: string }): lang is typeof PLAIN_TEXT => lang.name === "PlainText"

export const languageList = [PLAIN_TEXT, ...languageData]

export async function changeLanguage(view: EditorView, lang: CodeLanguage): Promise<void> {
  if (isPlainText(lang)) {
    return view.dispatch({
      effects: languageConf.reconfigure([]),
    })
  }
  if (!lang.support) await lang.load()
  view.dispatch({
    effects: languageConf.reconfigure(lang.support!),
  })
}

export function matchLanguageName(languages: CodeLanguage[], name: string): CodeLanguage {
  const _name = name.toLowerCase()
  return languages.find(({ alias }) => alias.some(a => a === _name)) ?? PLAIN_TEXT
}
