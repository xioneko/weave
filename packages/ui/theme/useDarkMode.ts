import { createGlobalComposable } from "../components/shared/createSharedComposable"
import { type Ref, ref, onScopeDispose, watch } from "vue"

export const ThemeAttr = "data-theme"
export const DarkTheme = "dark"
export const LightTheme = "light"

const ThemeKey = "weave-theme"

export const useDarkMode = createGlobalComposable((): Ref<boolean> => {
  const preferredDark = usePreferredDarkScheme()
  const theme = localStorage.getItem(ThemeKey)
  if (theme) {
    document.documentElement.setAttribute(ThemeAttr, theme)
  }
  const isDark = ref(theme ? theme === DarkTheme : preferredDark.value)

  watch(preferredDark, dark => {
    const theme = localStorage.getItem(ThemeKey)
    if (theme && dark === isDark.value) {
      removeTheme()
    } else if (!theme) {
      isDark.value = dark
    }
  })

  watch(isDark, dark => {
    if (dark === preferredDark.value) {
      removeTheme()
    } else {
      setTheme(dark ? DarkTheme : LightTheme)
    }
  })

  return isDark
})

function setTheme(theme: string) {
  document.documentElement.setAttribute(ThemeAttr, theme)
  localStorage.setItem(ThemeKey, theme)
}

function removeTheme() {
  document.documentElement.removeAttribute(ThemeAttr)
  localStorage.removeItem(ThemeKey)
}

function usePreferredDarkScheme() {
  const query = window.matchMedia("(prefers-color-scheme: dark)")
  const preferredDark = ref(query.matches)

  const onMediaQueryChange = (event: MediaQueryListEvent) => {
    if (event.matches) {
      preferredDark.value = true
    } else {
      preferredDark.value = false
    }
  }

  query.addEventListener("change", onMediaQueryChange)

  onScopeDispose(() => {
    query.removeEventListener("change", onMediaQueryChange)
  })

  return preferredDark
}
