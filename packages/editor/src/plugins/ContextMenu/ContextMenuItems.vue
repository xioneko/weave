<script setup lang="ts">
import { useComposerContext } from "#components"
import * as css from "./ContextMenu.css"
import { ContextMenuItem } from "./ContextMenuItem"
import * as Menu from "@weave/ui/components/Menu"
import { Chevron } from "@weave/ui/icons"

const { items } = defineProps<{
  items: ContextMenuItem[]
}>()

const { editor } = useComposerContext()
</script>

<template>
  <template v-for="item in items">
    <Menu.Item
      v-if="item.type === 'item'"
      :class="['ContextMenu__item', css.item]"
      @select="item.action(editor)"
    >
      <span>{{ item.title }}</span>
      <span :class="['ContextMenu__item-keyboardShortcut', css.keyboardShortcut]">{{
        item.keyboardShortcut
      }}</span>
    </Menu.Item>
    <Menu.MenuSub v-else-if="item.type === 'submenu'">
      <Menu.SubTrigger :class="['ContextMenu__subTrigger', css.subTrigger]">
        <span>{{ item.title }}</span>
        <Chevron.Right :width="20" :height="20" />
      </Menu.SubTrigger>
      <Teleport to="body">
        <Menu.Transition @enter="Menu.fadeIn" @leave="Menu.fadeOut">
          <Menu.SubContent :class="['ContextMenu__content', css.content]">
            <ContextMenuItems :items="item.children" />
          </Menu.SubContent>
        </Menu.Transition>
      </Teleport>
    </Menu.MenuSub>
    <div v-else :class="['ContextMenu__separator', css.separator]" />
  </template>
</template>
