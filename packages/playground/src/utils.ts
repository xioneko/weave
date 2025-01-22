import type { ErrorPayload } from "vite"
import type { CSSProperties } from "vue"

export const showErrorOverlay = (err: Partial<ErrorPayload["err"]>) => {
  const ErrorOverlay = customElements.get("vite-error-overlay")
  if (ErrorOverlay == null) return
  document.body.appendChild(new ErrorOverlay(err))
}

export async function importTextFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0]
      if (file == null) return reject(new Error("No file selected"))
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file, "utf-8")
    }
    input.click()
  })
}

export function exportFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function currentDateTime(): string {
  const now = new Date()
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  return dateFormatter.format(now).replace(/\//g, "-").replace(/,/g, "").replace(" ", "_")
}

interface ToastOptions {
  className: string
  spaceWithHeight: number
  duration: number
  marginBottom: number
}

export function createToast(options: ToastOptions) {
  let toastIndex = 0
  let toastCount = 0
  return function showToast(message: string) {
    const toast = document.createElement("div")
    toast.className = options.className
    toast.textContent = message
    toastIndex++
    toastCount++
    document.body.style.setProperty("--latest-toast-index", String(toastIndex))
    Object.assign(toast.style, {
      position: "fixed",
      left: "0",
      right: "0",
      bottom: `${options.marginBottom}px`,
      marginInline: "auto",
      width: "max-content",
      transition: "transform 0.5s cubic-bezier(.07,.36,.26,.98)",
      transform: `translateY(calc(-1 * (var(--latest-toast-index) - ${toastIndex}) * ${options.spaceWithHeight}px))`,
    } satisfies CSSProperties)
    document.body.appendChild(toast)
    toast.animate([{ opacity: 0, transform: `translateY(24px)` }, {}], {
      duration: 300,
      easing: "cubic-bezier(.07,.36,.26,.98)",
      delay: 200,
      fill: "backwards",
    })
    window.setTimeout(() => {
      toast.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
      }).onfinish = () => {
        toast.remove()
        toastCount--
        if (toastCount === 0) {
          toastIndex = 0
          document.body.style.removeProperty("--latest-toast-index")
        }
      }
    }, options.duration)
  }
}

export async function compressToURLHash(data: string): Promise<string> {
  const compressionStream = new CompressionStream("gzip")
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(data))
      controller.close()
    },
  }).pipeThrough(compressionStream)
  const chunks = []
  for await (const chunk of streamToIterable(stream)) {
    chunks.push(chunk)
  }
  const bytes = new Uint8Array(
    chunks.reduce<number[]>((acc, curr) => acc.concat(Array.from(curr)), []),
  )
  const base64 = window.btoa(String.fromCharCode(...bytes))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export async function decompressFromURLHash(hash: string): Promise<string> {
  const base64 = hash.replace(/-/g, "+").replace(/_/g, "/")
  const bytes = Array.from(window.atob(base64)).map(c => c.charCodeAt(0))
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(bytes))
      controller.close()
    },
  })
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeThrough(new TextDecoderStream())
  const chars = []
  for await (const char of streamToIterable(stream)) {
    chars.push(char)
  }
  return chars.join("")
}

async function* streamToIterable<T>(stream: ReadableStream<T>) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}
