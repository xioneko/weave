export function debounce<Fn extends (...args: any[]) => void>(fn: Fn, wait: number) {
  let timer: number
  return (...args: Parameters<Fn>) => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn(...args)
    }, wait)
  }
}

export async function isUTF8(blob: Blob): Promise<boolean> {
  const decoder = new TextDecoder("utf-8", { fatal: true })
  const buffer = await blob.arrayBuffer()
  try {
    decoder.decode(buffer)
  } catch (e) {
    if (e instanceof TypeError) return false
    throw e
  }
  return true
}

export function getOrPut<K, V, T extends V>(
  map: Map<K, V> | (K extends WeakKey ? WeakMap<K, V> : never),
  key: K,
  value: () => T,
): V {
  if (!map.has(key)) {
    map.set(key, value())
  }
  return map.get(key)!
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
