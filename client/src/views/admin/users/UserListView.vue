<script setup lang="ts">
import { mockUsers } from '@/mock';
import { USER_ROLE_LABEL } from '@/types/user';
import PageHeader from '@/components/common/PageHeader.vue';
import { formatDate } from '@/utils/format';

const ROLE_TONE: Record<string, string> = {
  ADMIN: 'badge-red',
  STAFF: 'badge-blue',
  CUSTOMER: 'badge-gray',
};
</script>

<template>
  <div>
    <PageHeader title="사용자관리" subtitle="관리자, 직원, 고객 계정을 관리합니다.">
      <template #actions>
        <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">+ 사용자 추가</button>
      </template>
    </PageHeader>

    <div class="panel">
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>연락처</th>
              <th>역할</th>
              <th>상태</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in mockUsers" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.phone ?? '-' }}</td>
              <td><span class="badge" :class="ROLE_TONE[u.role]">{{ USER_ROLE_LABEL[u.role] }}</span></td>
              <td>
                <span class="badge" :class="u.isActive ? 'badge-green' : 'badge-gray'">{{ u.isActive ? '활성' : '비활성' }}</span>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
