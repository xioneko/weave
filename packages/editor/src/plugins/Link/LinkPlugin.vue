<script lang="ts">
const ShowDelay = 400
const HideDelay = 500
</script>

<script setup lang="ts">
import { useComposerContext } from "#components/EditorComposer.vue"
import { getViewportElement } from "#components/EditorViewport.vue"
import { usePluginsHostContext } from "#components/PluginsHost.vue"
import FloatingToolbar, { type FloatingToolbarPluginApi } from "#plugins/FloatingToolbar"
import { getNodeKeyFromDOMNode, registerNodeElementMutationListener } from "#shared/node.ts"
import { $unLink, LinkNode } from "./LinkNode"
import * as css from "./LinkPopper.css"
import { registerLink } from "./registerLink"
import { getLinkToolbarItem } from "./toolbarItem"
import { mergeRegister } from "@lexical/utils"
import { vDismissable, type vDismissableValue, vScrollLock, vSelect } from "@weave/ui/components"
import * as Popper from "@weave/ui/components/Popper"
import { Edit, Unlink, Link } from "@weave/ui/icons"
import { $getNodeByKey, $getSelection, NodeKey } from "lexical"
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue"

const { editor } = useComposerContext()
const { registerPluginMountedHook } = usePluginsHostContext()

const showPopper = ref<"tooltip" | "editor" | null>(null)
const popperAnchorRef = ref<Popper.Measurable | null>(null)
const inputRef = useTemplateRef("inputKey")
const cleanupFns = new Map<any, () => void>()

const handlePointerUp = (event: MouseEvent) => {
  const selection = editor.read($getSelection)
  if (
    !selection ||
    !selection.isCollapsed() ||
    event.altKey ||
    // Left click or middle click
    (event.button !== 0 && event.button !== 1)
  )
    return
  const linkElem = event.currentTarget as HTMLAnchorElement
  if (linkElem.href) {
    try {
      const url = new URL(linkElem.href)
      window.open(url, "_blank", "noreferrer")
    } catch {
      // Ignore
    }
  }
}

let anchorLink: LinkNode | undefined
let showTimeout: number | undefined
let hideTimeout: number | undefined
const handleMouseEnterLink = (event: MouseEvent) => {
  if (showPopper.value !== "editor") {
    const linkElem = event.currentTarget as HTMLAnchorElement
    showTimeout = window.setTimeout(() => {
      const nodeKey = getNodeKeyFromDOMNode(linkElem, editor)!
      anchorLink = editor.read(() => $getNodeByKey<LinkNode>(nodeKey))!
      popperAnchorRef.value = linkElem
      showPopper.value = "tooltip"
      showTimeout = undefined
      window.clearTimeout(hideTimeout)
    }, ShowDelay)
  }
}
const handleMouseLeaveLink = () => {
  if (showTimeout) {
    window.clearTimeout(showTimeout)
    showTimeout = undefined
  } else if (showPopper.value === "tooltip") {
    hideTimeout = window.setTimeout(() => {
      if (!showTimeout) showPopper.value = null
    }, HideDelay)
  }
}
const handleMouseEnterTooltip = () => {
  window.clearTimeout(hideTimeout)
}
const handleMouseLeaveTooltip = () => {
  if (showPopper.value === "tooltip") {
    hideTimeout = window.setTimeout(() => {
      showPopper.value = null
    }, HideDelay)
  }
}

const handleEditClick = () => {
  showPopper.value = "editor"
}

const handleUnlinkClick = () => {
  const link = anchorLink!
  editor.update(() => {
    $unLink(link)
    showPopper.value = null
  })
}

const updateLinkAndHidePopper = () => {
  const link = anchorLink!
  const input = inputRef.value!
  if (input.value !== link.__url) {
    editor.update(() => {
      link.setUrl(input.value)
    })
  }
  showPopper.value = null
}

const handleInputKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault()
    updateLinkAndHidePopper()
    editor.update(() => anchorLink!.select())
  }
}

const handleDismiss: vDismissableValue = {
  onEscapeKeyDown() {
    showPopper.value = null
    editor.update(() => anchorLink!.select())
  },
  onPointerDownOutside() {
    updateLinkAndHidePopper()
  },
  onFocusOutside() {
    updateLinkAndHidePopper()
  },
}

let viewportElement: HTMLElement
onMounted(() => {
  const rootElement = editor.getRootElement()
  viewportElement = getViewportElement(rootElement)
})

let floatingToolbar: FloatingToolbarPluginApi | undefined
watch(showPopper, show => {
  if (!show && floatingToolbar) floatingToolbar.enable()
})

onUnmounted(
  mergeRegister(
    registerLink(editor),
    registerPluginMountedHook<FloatingToolbarPluginApi>(FloatingToolbar.id, plugin => {
      floatingToolbar = plugin
      const isLink = ref(false)
      const linkToolbarItem = getLinkToolbarItem(isLink, editor, plugin, link => {
        anchorLink = link
        popperAnchorRef.value = editor.getElementByKey(link.__key)!
        showPopper.value = "editor"
      })
      const unregister = floatingToolbar.registerItem(linkToolbarItem)
      cleanupFns.set(FloatingToolbar.id, unregister)
    }),
    registerNodeElementMutationListener(editor, LinkNode, mutation => {
      if (mutation.type === "created") {
        const { element, nodeKey } = mutation
        element.addEventListener("pointerup", handlePointerUp)
        element.addEventListener("mouseenter", handleMouseEnterLink)
        element.addEventListener("mouseleave", handleMouseLeaveLink)
        cleanupFns.set(nodeKey, () => {
          element.removeEventListener("pointerup", handlePointerUp)
          element.removeEventListener("mouseenter", handleMouseEnterLink)
          element.removeEventListener("mouseleave", handleMouseLeaveLink)
        })
      } /* mutation.type === "destroyed" */ else {
        cleanupFns.get(mutation.nodeKey)!()
        cleanupFns.delete(mutation.nodeKey)
      }
    }),
    () => {
      cleanupFns.forEach(fn => fn())
    },
  ),
)
</script>

<template>
  <Popper.Root>
    <Popper.Anchor :virtual-element="popperAnchorRef" />
    <Popper.Transition @leave="Popper.fadeOut">
      <Popper.Content
        v-if="showPopper === 'tooltip'"
        :class="['Link__tooltip', css.tooltip]"
        :side-offset="5"
        @mouseenter="handleMouseEnterTooltip"
        @mouseleave="handleMouseLeaveTooltip"
      >
        <span :class="['Link__tooltip-text', css.tooltipText]">{{ anchorLink!.__url }}</span>
        <span :class="['Link__tooltip-btn', css.tooltipBtn]" @click="handleEditClick">
          <Edit width="100%" height="100%" />
        </span>
        <span :class="['Link__tooltip-btn', css.tooltipBtn]" @click="handleUnlinkClick">
          <Unlink width="100%" height="100%" />
        </span>
      </Popper.Content>
      <Popper.Content
        v-if="showPopper === 'editor'"
        :class="['Link__editor', css.editor]"
        :side-offset="5"
        v-dismissable="handleDismiss"
        v-scroll-lock="viewportElement"
      >
        <label :class="['Link__editor-label', css.editorLabel]">
          <span :class="['Link__editor-icon', css.editorLabelIcon]">
            <Link width="100%" height="100%" />
          </span>
          <input
            ref="inputKey"
            :class="['Link__editor-input', css.editorInput]"
            spellcheck="false"
            autocomplete="false"
            :value="anchorLink?.__url"
            @keydown="handleInputKeyDown"
            v-select="true"
          />
        </label>
      </Popper.Content>
    </Popper.Transition>
  </Popper.Root>
</template>
