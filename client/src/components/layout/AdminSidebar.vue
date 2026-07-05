<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { ADMIN_MENU } from '@/config/menu';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const ui = useUiStore();

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`);
}

function onNavClick() {
  ui.closeMobileSidebar();
}
</script>

<template>
  <aside
    class="admin-sidebar"
    :class="{
      collapsed: ui.sidebarCollapsed && !ui.sidebarMobileOpen,
      'mobile-open': ui.sidebarMobileOpen,
    }"
  >
    <div class="sidebar-logo">
      <span>🌿</span>
      <span v-if="!ui.sidebarCollapsed || ui.sidebarMobileOpen">Ask Plant Admin</span>
    </div>
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in ADMIN_MENU"
        :key="item.to"
        :to="item.to"
        class="sidebar-link"
        :class="{ active: isActive(item.to) }"
        @click="onNavClick"
      >
        <span class="sidebar-icon">{{ item.icon }}</span>
        <span v-if="!ui.sidebarCollapsed || ui.sidebarMobileOpen">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div v-if="!ui.sidebarCollapsed || ui.sidebarMobileOpen" class="sidebar-footer">Ask Plant Admin v1.0</div>
  </aside>
</template>
