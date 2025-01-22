export function debounce<Fn extends (...args: any[]) => void>(fn: Fn, wait: number) {
  let timer: number
  return function (...args: Parameters<Fn>) {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn(...args)
    }, wait)
  }
}
