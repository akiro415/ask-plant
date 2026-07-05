<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ADMIN_MENU } from '@/config/menu';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const ui = useUiStore();
const auth = useAuthStore();

const visibleMenu = computed(() =>
  ADMIN_MENU.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return auth.hasRole(...item.roles);
  }),
);

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
        v-for="item in visibleMenu"
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
