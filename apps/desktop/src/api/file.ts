import { Channel, invoke } from "@tauri-apps/api/core"
import type { BaseDirectory } from "@tauri-apps/api/path"
import type { Simplify } from "type-fest"

export type DirEntry = {
  name: string
  path: string
  isDir: boolean
  ext?: string
  atime?: number
  mtime?: number
  ctime?: number
}

export async function readDir(path: string, baseDir?: BaseDirectory): Promise<DirEntry[]> {
  const res = await invoke<DirEntry[]>("plugin:file|read_dir", { path, baseDir })
  return res
}

export async function readFile(path: string, baseDir?: BaseDirectory): Promise<string> {
  const res = await invoke<ArrayBuffer>("plugin:file|read_file", { path, baseDir })
  return new TextDecoder().decode(res)
}

export async function upsertFile(
  path: string,
  content: string,
  baseDir?: BaseDirectory,
): Promise<void> {
  await invoke<void>("plugin:file|upsert_file", { path, content, baseDir })
}

export async function remove(path: string, baseDir?: BaseDirectory): Promise<void> {
  await invoke<void>("plugin:file|remove", { path, baseDir })
}

export async function rename(
  path: string,
  newName: string,
  baseDir?: BaseDirectory,
): Promise<void> {
  await invoke<void>("plugin:file|rename", { path, newName, baseDir })
}

export async function move(
  fromPath: string,
  toPath: string,
  overwrite: boolean,
  baseDir?: BaseDirectory,
): Promise<void> {
  await invoke<void>("plugin:file|move_file_or_dir", {
    from: fromPath,
    to: toPath,
    overwrite,
    baseDir,
  })
}

export type WatchEvent = Simplify<
  | { type: "any" }
  | ({ type: "access" } & AccessEventKind)
  | ({ type: "create" } & CreateEventKind)
  | ({ type: "modify" } & ModifyEventKind)
  | ({ type: "remove" } & RemoveEventKind)
  | { type: "other" }
>

type AccessEventKind =
  | { kind: "any" }
  | { kind: "close"; mode: "any" | "execute" | "read" | "write" | "other" }
  | { kind: "open"; mode: "any" | "execute" | "read" | "write" | "other" }
  | { kind: "other" }

// prettier-ignore
type CreateEventKind =
  | { kind: "any" }
  | { kind: "file" }
  | { kind: "folder" }
  | { kind: "other" }

type ModifyEventKind =
  | { kind: "any" }
  | { kind: "data"; mode: "any" | "size" | "content" | "other" }
  | {
      kind: "metadata"
      mode:
        | "any"
        | "access-time"
        | "write-time"
        | "permissions"
        | "ownership"
        | "extended"
        | "other"
    }
  | { kind: "rename"; mode: "any" | "to" | "from" | "both" | "other" }
  | { kind: "other" }

// prettier-ignore
type RemoveEventKind =
  | { kind: "any" }
  | { kind: "file" }
  | { kind: "folder" }
  | { kind: "other" }

export type WatcherOptions = {
  recursive?: boolean
  debounce?: number
}

export type UnwatchFn = () => Promise<void>

export async function watch(
  paths: string[],
  onEvent: (event: WatchEvent) => void,
  options?: WatcherOptions,
): Promise<UnwatchFn> {
  const channel = new Channel<WatchEvent>()
  channel.onmessage = onEvent
  const rid = await invoke<number>("plugin:file|watch", {
    paths,
    onEvent: channel,
    options,
  })
  return async () => {
    await invoke<void>("plugin:file|unwatch", { rid })
  }
}
