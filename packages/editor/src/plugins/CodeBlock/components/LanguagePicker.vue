<script lang="ts">
export interface LanguagePickerProps {
  languages: CodeLanguage[]
}
</script>

<script lang="ts" setup>
import * as AutoComplete from "@weave/ui/components/AutoComplete"
import * as Popper from "@weave/ui/components/Popper"
import { PopperContentProps } from "@weave/ui/components/Popper"
import { prefixSubsequenceMatcher } from "@weave/ui/components/AutoComplete"
import { vDismissable, type vDismissableValue, vFocus, vScrollLock } from "@weave/ui/components"
import { Chevron } from "@weave/ui/icons"
import { onMounted, ref, useTemplateRef } from "vue"
import * as css from "./LanguagePicker.css"
import { CodeLanguage } from "../extensions/languages"
import { useComposerContext, getViewportElement } from "#components"

const { languages } = defineProps<LanguagePickerProps>()
defineOptions({ inheritAttrs: false })
const language = defineModel<CodeLanguage>({ required: true })

const { editor } = useComposerContext()

const opened = ref(false)
const triggerRef = useTemplateRef("triggerKey")
const input = ref("")
const popperSide = ref<PopperContentProps["side"]>("bottom")

let viewportElement: HTMLElement

const matcher: AutoComplete.Matcher<CodeLanguage> = (lang, query) => {
  return lang.alias.some(x => prefixSubsequenceMatcher(x, query))
}

onMounted(() => {
  const rootElement = editor.getRootElement()
  viewportElement = getViewportElement(rootElement)
})

const handlePlacementChange = (side: PopperContentProps["side"]) => {
  // This is a workaround to prevent the popper from flipping when the height changes during text input
  popperSide.value = side
}

const handleClick = (event: MouseEvent) => {
  opened.value = !opened.value
  if (opened.value) input.value = ""
}

const handleDismiss: vDismissableValue = {
  onEscapeKeyDown(element) {
    opened.value = false
  },
  onPointerDownOutside(element, target) {
    if (triggerRef.value!.contains(target)) return
    opened.value = false
  },
  disableOutsidePointerEvents: true,
}

const handleAccept = (lang: CodeLanguage) => {
  language.value = lang
  opened.value = false
}
</script>

<template>
  <Popper.Root>
    <AutoComplete.Root v-model="input" :matcher>
      <Popper.Anchor as-child>
        <button
          :data-opened="opened || undefined"
          tabindex="-1"
          type="button"
          :class="['LanguagePicker__trigger', css.trigger]"
          v-bind="$attrs"
          ref="triggerKey"
          @click="handleClick"
        >
          <span :class="['LanguagePicker__trigger-text']">{{ language.name }}</span>
          <Chevron.Down :class="['LanguagePicker__trigger-icon']" />
        </button>
      </Popper.Anchor>
      <Teleport to="body">
        <Popper.Transition @enter="Popper.fadeScaleIn" @leave="Popper.fadeScaleOut">
          <Popper.Content
            v-if="opened"
            strategy="fixed"
            :class="['LanguagePicker__content', css.content]"
            :side="popperSide"
            :side-offset="5"
            :auto-update-options="{ elementResize: true }"
            set-popper-available-size-css-var
            set-transform-origin-css-var
            @placement-changed="handlePlacementChange"
            v-dismissable="handleDismiss"
            v-scroll-lock="viewportElement"
          >
            <AutoComplete.Input
              :class="['LanguagePicker__input', css.input]"
              placeholder="Search for a language…"
              spellcheck="false"
              autocomplete="off"
              v-focus.prevent="true"
            />
            <AutoComplete.Content tabindex="-1" :class="['LanguagePicker__list', css.list]">
              <AutoComplete.Item
                v-for="lang in languages"
                :class="['LanguagePicker__item', css.item]"
                :key="lang.name"
                :value="lang"
                @accept="handleAccept(lang)"
              >
                {{ lang.name }}
              </AutoComplete.Item>
            </AutoComplete.Content>
          </Popper.Content>
        </Popper.Transition>
      </Teleport>
    </AutoComplete.Root>
  </Popper.Root>
</template>
