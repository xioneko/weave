/*@__NO_SIDE_EFFECTS__*/
export function __assert__(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg ?? "..."}`)
  }
}

/*@__NO_SIDE_EFFECTS__*/
export function __trace__(
  ctor: (new () => any) | undefined,
  fn: Function,
  args: IArguments,
  ...msgs: any[]
): void {
  const className = ctor?.name
  const funcName = fn.name || "<anonymous>"
  if (className) {
    // eslint-disable-next-line no-console
    console.trace(`[${className}.${funcName}]`, ...args, ...msgs)
  } else {
    // eslint-disable-next-line no-console
    console.trace(`[${funcName}]`, ...args, ...msgs)
  }
}

/*@__NO_SIDE_EFFECTS__*/
export function __warn__(fn?: Function, ...msgs: any[]): void {
  const funcName = fn?.name || "<anonymous>"
  // eslint-disable-next-line no-console
  console.warn(`[${funcName}]`, ...msgs)
}
