import { effectScope, onScopeDispose, type EffectScope } from 'vue'

export function createSharedComposable<Fn extends (...args: any[]) => any, Key = string | symbol>(
  composable: Fn,
): (key: Key, ...args: Parameters<Fn>) => ReturnType<Fn> {
  const scopes = new Map<Key, { subscribers: number; state: ReturnType<Fn>; dispose: () => void }>()

  const dispose = (key: Key) => {
    return () => {
      const scope = scopes.get(key)
      if (scope) {
        scope.subscribers -= 1
        if (scope.subscribers <= 0) {
          scopes.delete(key)
          scope.dispose()
        }
      }
    }
  }

  return (key: Key, ...args: Parameters<Fn>) => {
    let sharedScope = scopes.get(key)
    if (!sharedScope) {
      const scope = effectScope(true)
      const state = scope.run(() => composable(...args))
      sharedScope = {
        subscribers: 0,
        state,
        dispose: () => scope.stop(),
      }
      scopes.set(key, sharedScope)
    }
    sharedScope.subscribers += 1
    onScopeDispose(dispose(key))

    return sharedScope.state
  }
}

export function createGlobalComposable<Fn extends (...args: any[]) => any>(composable: Fn): Fn {
  let subscribers = 0
  let state: ReturnType<Fn> | undefined
  let scope: EffectScope | undefined

  const dispose = () => {
    subscribers -= 1
    if (scope && subscribers <= 0) {
      scope.stop()
      state = undefined
      scope = undefined
    }
  }

  return <Fn>((...args) => {
    subscribers += 1
    if (!scope) {
      scope = effectScope(true)
      state = scope.run(() => composable(...args))
    }
    onScopeDispose(dispose)
    return state
  })
}