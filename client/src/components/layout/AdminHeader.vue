<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '@/stores/ui';
import { mockUsers } from '@/mock';
import { USER_ROLE_LABEL } from '@/types/user';

const route = useRoute();
const ui = useUiStore();

const pageTitle = computed(() => (route.meta.title as string) ?? 'Ask Plant');
const currentAdmin = mockUsers.find((u) => u.role === 'ADMIN')!;
</script>

<template>
  <header class="admin-header">
    <div class="header-left">
      <button class="header-toggle" type="button" @click="ui.toggleSidebar" aria-label="사이드바 토글">☰</button>
      <span class="header-title">{{ pageTitle }}</span>
      <span class="header-mock-badge">MOCK DATA</span>
    </div>
    <div class="header-right">
      <div class="header-search">
        <input type="text" placeholder="통합 검색 (목업)" disabled />
      </div>
      <div class="header-user">
        <div class="header-avatar">{{ currentAdmin.name.slice(0, 1) }}</div>
        <div class="header-user-info">
          <div class="header-user-name">{{ currentAdmin.name }}</div>
          <div class="header-user-role">{{ USER_ROLE_LABEL[currentAdmin.role] }}</div>
        </div>
      </div>
    </div>
  </header>
</template>
