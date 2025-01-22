<script lang="ts">
export interface SlashMenuPluginApi {
  registerItems: (...items: SlashMenuItem[]) => () => void
}
</script>

<script setup lang="ts">
import { useComposerContext, getViewportElement } from "#components"
import { $isElementBlock } from "#core/nodes"
import * as css from "./SlashMenu.css"
import { SlashMenuItem, SlashMenuIcon } from "./SlashMenuItem"
import VirtualInput from "./components/VirtualInput.vue"
import { vDismissable, type vDismissableValue, vScrollLock } from "@weave/ui/components"
import * as AutoComplete from "@weave/ui/components/AutoComplete"
import * as Popper from "@weave/ui/components/Popper"
import { $getSelection, $isRangeSelection, Point } from "lexical"
import { onMounted, onUnmounted, Ref, ref, shallowRef } from "vue"

const { editor } = useComposerContext()

const openMenu = ref(false)
const query = ref("")
const _inputValue = ref("")

const items = shallowRef<SlashMenuItem[]>([])
let slashAnchor: Point | null = null
let viewportElement: HTMLElement
let menuAnchor: Ref<Popper.Measurable | null> = ref(null)

onMounted(() => {
  const rootElement = editor.getRootElement()
  viewportElement = getViewportElement(rootElement)
})

onUnmounted(
  editor.registerTextContentListener(() => {
    editor.read(() => {
      if (editor.isComposing()) return
      const selection = $getSelection()
      if (
        $isRangeSelection(selection) &&
        selection.isCollapsed() &&
        selection.anchor.type === "text"
      ) {
        const node = selection.anchor.getNode()
        if (node.isSimpleText()) {
          if (!openMenu.value) {
            const parent = node.getParent()
            if ($isElementBlock(parent)) {
              const text = node.__text
              const len = text.length
              if (len > 0 && text[len - 1] === "/" && (len === 1 || /\s/.test(text[len - 2]))) {
                query.value = ""
                openMenu.value = true
                slashAnchor = selection.anchor
                const anchorElem = editor.getElementByKey(node.__key)!
                const { right, height, top } = anchorElem.getBoundingClientRect()
                menuAnchor.value = {
                  getBoundingClientRect: () => DOMRect.fromRect({ x: right, y: top, height }),
                }
                return
              }
            }
          } else {
            const [_, queryText] = node.getTextContent().trimEnd().split("/")
            if (queryText) {
              query.value = queryText
              return
            } // else: This usually happens when the user deletes the slash
          }
        }
      }
      if (openMenu.value) {
        openMenu.value = false
      }
    })
  }),
)

const handleNoMatch = () => {
  openMenu.value = false
}

const handleAccept = (item: SlashMenuItem) => {
  openMenu.value = false
  editor.update(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection) || !slashAnchor) return
    selection.anchor.set(slashAnchor.key, slashAnchor.offset - 1, "text")
    selection.removeText()
    item.action(editor, selection)
  })
}

const handleDismiss: vDismissableValue = {
  onEscapeKeyDown() {
    openMenu.value = false
  },
  onPointerDownOutside() {
    openMenu.value = false
  },
  disableOutsidePointerEvents: true,
}

defineExpose<SlashMenuPluginApi>({
  registerItems(...item) {
    items.value.push(...item)
    const ids = new Set(item.map(it => it.id))
    return () => {
      items.value = items.value.filter(it => !ids.has(it.id))
    }
  },
})
</script>

<template>
  <Popper.Root>
    <AutoComplete.Root v-model="_inputValue" :matcher="AutoComplete.subsequenceMatcher">
      <Popper.Anchor :virtual-element="menuAnchor" />
      <template v-if="openMenu">
        <VirtualInput :query />
        <Teleport to="body">
          <Popper.Content
            strategy="fixed"
            align="start"
            :side-offset="5"
            :auto-update-options="{ elementResize: true }"
            set-popper-available-size-css-var
            as-child
            v-dismissable="handleDismiss"
            v-scroll-lock="viewportElement"
          >
            <AutoComplete.Content
              :class="['SlashMenu__content', css.content]"
              @no-match="handleNoMatch"
            >
              <AutoComplete.Item
                v-for="item of items"
                :class="['SlashMenu__item', css.item]"
                :key="item.id"
                :value="item.title"
                @accept="handleAccept(item)"
              >
                <span :class="['SlashMenu__item-icon', css.itemIcon]">
                  <SlashMenuIcon :component="item.icon" />
                </span>
                <span :class="['SlashMenu__item-title']">
                  {{ item.title }}
                </span>
              </AutoComplete.Item>
            </AutoComplete.Content>
          </Popper.Content>
        </Teleport>
      </template>
    </AutoComplete.Root>
  </Popper.Root>
</template>
