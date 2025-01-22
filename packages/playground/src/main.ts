import App from "./App.vue"
import { showErrorOverlay } from "./utils"
import "@weave/ui/reset"
import { createApp } from "vue"

const app = createApp(App)
app.mount("#app")

app.config.errorHandler = err => {
  showErrorOverlay(err instanceof Error ? err : new Error(`${err}`))
}
window.addEventListener("error", showErrorOverlay)
window.addEventListener("unhandledrejection", ev => {
  const reason = ev.reason
  if (!reason) return
  showErrorOverlay(reason instanceof Error ? reason : new Error(`Unhandled Rejection: ${reason}`))
})
