<script setup lang="ts">
import * as Menu from ".."
import * as styles from "./Menu.stories.css"
import MenuWithAnchor from "./_MenuWithAnchor.vue"
import SubMenu from "./_SubMenu.vue"

const alert = (s: string) => window.alert(s)
</script>

<template>
  <MenuWithAnchor open>
    <Menu.Item :class="styles.item" @select="alert('undo')"> Undo </Menu.Item>
    <SubMenu>
      <Menu.Item :class="styles.item" disabled> Disabled </Menu.Item>
      <Menu.Item :class="styles.item" @select="alert('one')"> One </Menu.Item>
      <SubMenu>
        <Menu.Item :class="styles.item" @select="alert('one')"> One </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('two')"> Two </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('three')"> Three </Menu.Item>
        <SubMenu heading="Four">
          <Menu.Item :class="styles.item" @select="alert('one')"> One </Menu.Item>
          <Menu.Item :class="styles.item" @select="alert('two')"> Two </Menu.Item>
          <Menu.Item :class="styles.item" @select="alert('three')"> Three </Menu.Item>
        </SubMenu>
        <Menu.Item :class="styles.item" @select="alert('five')"> Five </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('six')"> Six </Menu.Item>
      </SubMenu>
      <SubMenu heading="Sub Menu">
        <Menu.Item :class="styles.item" @select="alert('one')"> One </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('two')"> Two </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('three')"> Three </Menu.Item>
      </SubMenu>
      <Menu.Item :class="styles.item" @select="alert('two')"> Two </Menu.Item>
      <SubMenu disabled>
        <Menu.Item :class="styles.item" @select="alert('one')"> One </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('two')"> Two </Menu.Item>
        <Menu.Item :class="styles.item" @select="alert('three')"> Three </Menu.Item>
      </SubMenu>
      <Menu.Item :class="styles.item" @select="alert('three')"> Three </Menu.Item>
    </SubMenu>
    <div :class="styles.separator" />
    <Menu.Item :class="styles.item" disabled @select="alert('cut')"> Cut </Menu.Item>
    <Menu.Item :class="styles.item" @select="alert('copy')"> Copy </Menu.Item>
    <Menu.Item :class="styles.item" @select="alert('paste')"> Paste </Menu.Item>
  </MenuWithAnchor>
</template>
