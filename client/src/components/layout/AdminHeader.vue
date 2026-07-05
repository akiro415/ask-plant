<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { USER_ROLE_LABEL } from '@/types/user';
import BaseButton from '@/components/base/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();
const auth = useAuthStore();

const pageTitle = computed(() => (route.meta.title as string) ?? 'Ask Plant');
const isMock = computed(() => Boolean(route.meta.isMock));

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <header class="admin-header">
    <div class="header-left">
      <button class="header-toggle" type="button" @click="ui.toggleSidebar" aria-label="사이드바 토글">☰</button>
      <span class="header-title">{{ pageTitle }}</span>
      <span v-if="isMock" class="header-mock-badge">MOCK DATA</span>
    </div>
    <div class="header-right">
      <div class="header-search">
        <input type="text" placeholder="통합 검색 (목업)" disabled />
      </div>
      <div v-if="auth.user" class="header-user">
        <div class="header-avatar">{{ auth.user.name.slice(0, 1) }}</div>
        <div class="header-user-info">
          <div class="header-user-name">{{ auth.user.name }}</div>
          <div class="header-user-role">{{ USER_ROLE_LABEL[auth.user.role] }}</div>
        </div>
        <BaseButton variant="ghost" size="sm" class="header-logout" @click="handleLogout">로그아웃</BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-logout {
  margin-left: 0.4rem;
}
</style>
