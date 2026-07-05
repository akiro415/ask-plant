import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AdminUser, UserRole } from '@/types/user';
import {
  fetchUsers,
  fetchUserById as fetchUserByIdApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  type UpdateUserPayload,
  type CreateUserPayload,
} from '@/api/user.api';
import { extractErrorMessage } from '@/api/http';

export type UserActiveFilter = 'all' | 'active' | 'inactive';
export type UserSortOrder = 'asc' | 'desc';

export const useUserStore = defineStore('user', () => {
  const users = ref<AdminUser[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);
  const listLoaded = ref(false);

  const currentUser = ref<AdminUser | null>(null);
  const detailLoading = ref(false);
  const detailError = ref<string | null>(null);

  const includeInactive = ref(true);
  const activeFilter = ref<UserActiveFilter>('all');
  const searchQuery = ref('');
  const roleFilter = ref<UserRole | ''>('');
  const sortOrder = ref<UserSortOrder>('desc');

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const toggleLoadingId = ref<string | null>(null);
  const toggleError = ref<string | null>(null);

  const filtered = computed(() => {
    let list = users.value.filter((u) => {
      const haystack = [u.name, u.email, u.phone ?? ''].join(' ').toLowerCase();
      const matchesQuery = searchQuery.value ? haystack.includes(searchQuery.value.toLowerCase()) : true;
      const matchesRole = roleFilter.value ? u.role === roleFilter.value : true;
      const matchesActive =
        activeFilter.value === 'all'
          ? true
          : activeFilter.value === 'active'
            ? u.isActive
            : !u.isActive;
      return matchesQuery && matchesRole && matchesActive;
    });

    list = [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder.value === 'asc' ? diff : -diff;
    });

    return list;
  });

  function setSearch(value: string) {
    searchQuery.value = value;
  }

  function setRoleFilter(value: UserRole | '') {
    roleFilter.value = value;
  }

  function setIncludeInactive(value: boolean) {
    includeInactive.value = value;
    if (!value) activeFilter.value = 'active';
  }

  function setActiveFilter(value: UserActiveFilter) {
    activeFilter.value = value;
    includeInactive.value = value !== 'active';
  }

  function setSortOrder(value: UserSortOrder) {
    sortOrder.value = value;
  }

  function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  }

  /** GET /api/v1/users */
  async function fetchUserList() {
    listLoading.value = true;
    listError.value = null;
    try {
      users.value = await fetchUsers({ includeInactive: includeInactive.value });
      listLoaded.value = true;
    } catch (error) {
      listError.value = extractErrorMessage(error, '사용자 목록을 불러오지 못했습니다');
    } finally {
      listLoading.value = false;
    }
  }

  /** GET /api/v1/users/:id */
  async function fetchUserById(id: string) {
    detailLoading.value = true;
    detailError.value = null;
    currentUser.value = null;
    try {
      currentUser.value = await fetchUserByIdApi(id);
    } catch (error) {
      detailError.value = extractErrorMessage(error, '사용자 정보를 불러오지 못했습니다');
    } finally {
      detailLoading.value = false;
    }
  }

  /** POST /api/v1/users */
  async function createUser(payload: CreateUserPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await createUserApi(payload);
      await fetchUserList();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '사용자 등록에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** PUT /api/v1/users/:id */
  async function updateUser(id: string, payload: UpdateUserPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      const updated = await updateUserApi(id, payload);
      if (currentUser.value?.id === id) currentUser.value = updated;
      await fetchUserList();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '사용자 수정에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** 활성/비활성 토글 — PUT isActive */
  async function toggleUserActive(id: string, nextActive: boolean): Promise<boolean> {
    toggleLoadingId.value = id;
    toggleError.value = null;
    try {
      const updated = await updateUserApi(id, { isActive: nextActive });
      if (currentUser.value?.id === id) currentUser.value = updated;
      await fetchUserList();
      return true;
    } catch (error) {
      toggleError.value = extractErrorMessage(error, nextActive ? '활성화에 실패했습니다' : '비활성화에 실패했습니다');
      return false;
    } finally {
      toggleLoadingId.value = null;
    }
  }

  return {
    users,
    listLoading,
    listError,
    filtered,
    currentUser,
    detailLoading,
    detailError,
    includeInactive,
    activeFilter,
    searchQuery,
    roleFilter,
    sortOrder,
    formLoading,
    formError,
    toggleLoadingId,
    toggleError,
    setSearch,
    setRoleFilter,
    setIncludeInactive,
    setActiveFilter,
    setSortOrder,
    toggleSortOrder,
    fetchUserList,
    fetchUserById,
    createUser,
    updateUser,
    toggleUserActive,
  };
});
