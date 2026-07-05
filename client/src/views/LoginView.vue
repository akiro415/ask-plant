<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseButton from '@/components/base/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');

function redirectTarget(): string {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/admin/dashboard';
}

onMounted(() => {
  // 이미 로그인된 상태로 /login에 접근하면 바로 원래 목적지(또는 대시보드)로 보낸다.
  if (auth.isAuthenticated) {
    router.replace(redirectTarget());
  }
});

async function handleSubmit() {
  const success = await auth.login(email.value.trim(), password.value);
  if (success) {
    router.replace(redirectTarget());
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <span>🌿</span>
        <span>Ask Plant Admin</span>
      </div>
      <p class="login-subtitle">관리자 계정으로 로그인하세요.</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label for="email">이메일</label>
          <input id="email" v-model="email" type="email" autocomplete="username" required placeholder="admin@ask-plant.local" />
        </div>

        <div class="form-field">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
        </div>

        <p v-if="auth.loginError" class="login-error">{{ auth.loginError }}</p>

        <BaseButton type="submit" variant="primary" block class="login-submit" :disabled="auth.loginLoading">
          {{ auth.loginLoading ? '로그인 중...' : '로그인' }}
        </BaseButton>
      </form>

      <div class="login-hint">
        <p>테스트 계정 (개발용 seed 데이터)</p>
        <p><code>admin@ask-plant.local</code> / <code>admin1234!</code> (ADMIN)</p>
        <p><code>customer@ask-plant.local</code> / <code>customer1234!</code> (CUSTOMER)</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f5f7f5);
  padding: 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius, 10px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.1));
  padding: 2rem 1.75rem;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text, #1b2420);
  margin-bottom: 0.4rem;
}

.login-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted, #6c7a72);
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #1b2420);
}

.form-field input {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--color-border, #e5e9e5);
  border-radius: 8px;
  font-size: 0.9rem;
}

.login-error {
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--color-danger-bg, #fdecea);
  color: var(--color-danger, #dc3545);
  font-size: 0.83rem;
}

.login-submit {
  margin-top: 0.25rem;
}

.login-hint {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border, #e5e9e5);
  font-size: 0.76rem;
  color: var(--color-text-muted, #6c7a72);
  line-height: 1.6;
}

.login-hint code {
  background: var(--color-bg, #f5f7f5);
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
}
</style>
