<script setup lang="ts">
import { watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AdminSidebar from '@/components/layout/AdminSidebar.vue';
import AdminHeader from '@/components/layout/AdminHeader.vue';
import Breadcrumb from '@/components/layout/Breadcrumb.vue';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const ui = useUiStore();

watch(
  () => route.fullPath,
  () => {
    ui.closeMobileSidebar();
  },
);
</script>

<template>
  <div class="admin-layout">
    <div
      v-if="ui.sidebarMobileOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="ui.closeMobileSidebar()"
    />
    <AdminSidebar />
    <div class="admin-main">
      <AdminHeader />
      <Breadcrumb />
      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 20, 0.45);
  z-index: 35;
  backdrop-filter: blur(1px);
}
</style>
