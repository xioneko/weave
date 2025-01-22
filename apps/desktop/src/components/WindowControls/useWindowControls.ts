import { debounce } from "@/shared/utils"
import { window } from "@tauri-apps/api"
import { ref, type Ref } from "vue"

interface WindowControls {
  isMaximized: Readonly<Ref<boolean>>
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
}

export function useWindowControls(): WindowControls {
  const win = window.getCurrentWindow()
  const isMaximized = ref(false)

  const updateMaximized = async () => {
    isMaximized.value = await win.isMaximized()
  }
  updateMaximized()
  win.onResized(debounce(updateMaximized, 100))

  return {
    isMaximized,
    minimize: () => win.minimize(),
    toggleMaximize: () => {
      win.toggleMaximize()
    },
    close: () => win.close(),
  }
}
