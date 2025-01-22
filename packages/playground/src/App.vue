<script lang="ts">
interface AppContextValue {
  showToast: (message: string) => void
}
export const AppContext = Symbol("AppContext") as InjectionKey<AppContextValue>
</script>

<script setup lang="ts">
import introducing from "./assets/Introducing.json?raw"
import EditorActions from "./components/EditorActions.vue"
import GitHubCorner from "./components/GitHubCorner.vue"
import ThemeToggle from "./components/ThemeToggle.vue"
import { editorTheme } from "./editorTheme"
import * as css from "./styles.css"
import { compressToURLHash, createToast, decompressFromURLHash, showErrorOverlay } from "./utils"
import {
  ContentEditable,
  EditorComposer,
  defaultPlugins,
  EditorViewport,
  EditorTreeView,
} from "@weave/editor"
import * as Menu from "@weave/ui/components/Menu"
import { useTooltipSingleton } from "@weave/ui/components/Tooltip"
import { Import, Export, Bug, Trash, Share } from "@weave/ui/icons"
import { LexicalEditor } from "lexical"
import { InjectionKey, onMounted, provide, ref, shallowRef, useTemplateRef, watch } from "vue"

const composerRef = useTemplateRef("composerKey")
const actions = useTemplateRef("actionsKey")
const editor = shallowRef<LexicalEditor | null>(null)
const showTreeView = ref(localStorage.getItem("showTreeView") === "true")
const urlHash = window.location.hash
const initialEditorState = urlHash.startsWith("#doc=") ? undefined : introducing

const showToast = createToast({
  className: css.toast,
  spaceWithHeight: 48,
  duration: 3000,
  marginBottom: 36,
})

const { vTooltip, hide: hideTooltip } = useTooltipSingleton({
  defaultSide: "bottom",
  className: css.tooltip,
  sideOffset: 8,
  boundaryPadding: { right: 12 },
  showDelay: 500,
})

onMounted(() => {
  editor.value = composerRef.value!.editor
  if (urlHash.startsWith("#doc=")) {
    decompressFromURLHash(urlHash.slice(5))
      .then(json => {
        composerRef.value!.converter.fromJSON(JSON.parse(json))
      })
      .catch(() => {
        showToast("Failed to load shared document")
      })
  }
})

watch(showTreeView, show => {
  if (show) {
    localStorage.setItem("showTreeView", "true")
  } else {
    localStorage.removeItem("showTreeView")
  }
})

async function shareDocument() {
  if (!composerRef.value) return
  const data = composerRef.value.converter.toJSON()
  const url = new URL(window.location.href)
  const hash = await compressToURLHash(JSON.stringify(data))
  url.hash = `#doc=${hash}`
  const newUrl = url.toString()
  window.history.replaceState(null, "", newUrl)
  await navigator.clipboard.writeText(newUrl)
  showToast("Shared link copied")
}

provide(AppContext, { showToast })
</script>

<template>
  <GitHubCorner url="https://github.com/xioneko/weave" />
  <main>
    <EditorViewport :class="css.editorViewport">
      <EditorComposer
        ref="composerKey"
        namespace="WeaveEditor"
        :initialEditorState
        :theme="editorTheme"
        :plugins="defaultPlugins"
        @error="showErrorOverlay($event)"
      >
        <ContentEditable :class="css.contentEditable" spellcheck="false" />
        <EditorActions ref="actionsKey" />
      </EditorComposer>
    </EditorViewport>
    <div :class="css.buttonGroup">
      <div :class="css.iconBtn" v-tooltip="`Toggle Theme`">
        <ThemeToggle style="width: 100%; height: 100%" />
      </div>
      <Menu.Root @update:open="isOpen => isOpen && hideTooltip()">
        <Menu.Trigger>
          <div :class="css.iconBtn" v-tooltip="`Import`">
            <Import width="100%" height="100%" />
          </div>
        </Menu.Trigger>
        <Teleport to="body">
          <Menu.Transition @enter="Menu.fadeIn" @leave="Menu.fadeOut">
            <Menu.Content
              :class="css.menuContent"
              :side-offset="8"
              :collision-padding="{ right: 12 }"
            >
              <Menu.Item :class="css.menuItem" @select="actions?.importFromJSON"
                >Import from JSON</Menu.Item
              >
              <Menu.Item :class="css.menuItem" @select="actions?.importFromMarkdown">
                Import from Markdown
              </Menu.Item>
            </Menu.Content>
          </Menu.Transition>
        </Teleport>
      </Menu.Root>
      <Menu.Root @update:open="isOpen => isOpen && hideTooltip()">
        <Menu.Trigger>
          <div :class="css.iconBtn" v-tooltip="`Export`">
            <Export width="100%" height="100%" />
          </div>
        </Menu.Trigger>
        <Teleport to="body">
          <Menu.Transition @enter="Menu.fadeIn" @leave="Menu.fadeOut">
            <Menu.Content
              :class="css.menuContent"
              :side-offset="8"
              :collision-padding="{ right: 12 }"
            >
              <Menu.Item :class="css.menuItem" @select="actions?.exportAsJSON">
                Export as JSON
              </Menu.Item>
              <Menu.Item :class="css.menuItem" @select="actions?.exportAsMarkdown">
                Export as Markdown
              </Menu.Item>
              <Menu.Item :class="css.menuItem" @select="actions?.copyJSON">
                Copy to Clipboard as JSON
              </Menu.Item>
              <Menu.Item :class="css.menuItem" @select="actions?.copyMarkdown">
                Copy to Clipboard as Markdown
              </Menu.Item>
              <Menu.Item :class="css.menuItem" @select="actions?.copyHTML"
                >Copy to Clipboard as HTML
              </Menu.Item>
            </Menu.Content>
          </Menu.Transition>
        </Teleport>
      </Menu.Root>
      <div :class="css.iconBtn" v-tooltip="`Share`" @click="shareDocument">
        <Share width="100%" height="100%" />
      </div>
      <div :class="css.iconBtn" v-tooltip="`Clear Editor`" @click="actions?.clearEditor">
        <Trash width="100%" height="100%" />
      </div>
      <div
        :class="css.iconBtn"
        v-tooltip="`Toggle Debug View`"
        @click="showTreeView = !showTreeView"
      >
        <Bug width="100%" height="100%" />
      </div>
    </div>
  </main>
  <div v-if="showTreeView && editor" :class="css.debugView">
    <EditorTreeView :class="css.editorTreeView" :editor />
  </div>
</template>
