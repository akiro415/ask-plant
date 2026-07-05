import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AdminUser, UserRole } from '@/types/user';
import { fetchUsers, updateUser as updateUserApi, deleteUser as deleteUserApi, type UpdateUserPayload } from '@/api/user.api';
import { extractErrorMessage } from '@/api/http';

export const useUserStore = defineStore('user', () => {
  const users = ref<AdminUser[]>([]);
  const listLoading = ref(false);
  const listError = ref<string | null>(null);
  const listLoaded = ref(false);

  const includeInactive = ref(true);
  const searchQuery = ref('');
  const roleFilter = ref<UserRole | ''>('');

  const formLoading = ref(false);
  const formError = ref<string | null>(null);
  const deleteLoadingId = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  const filtered = computed(() => {
    return users.value.filter((u) => {
      const haystack = [u.name, u.email, u.phone ?? ''].join(' ').toLowerCase();
      const matchesQuery = searchQuery.value ? haystack.includes(searchQuery.value.toLowerCase()) : true;
      const matchesRole = roleFilter.value ? u.role === roleFilter.value : true;
      return matchesQuery && matchesRole;
    });
  });

  function setSearch(value: string) {
    searchQuery.value = value;
  }

  function setRoleFilter(value: UserRole | '') {
    roleFilter.value = value;
  }

  function setIncludeInactive(value: boolean) {
    includeInactive.value = value;
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

  /** PUT /api/v1/users/:id — 성공 시 목록 refetch */
  async function updateUser(id: string, payload: UpdateUserPayload): Promise<boolean> {
    formLoading.value = true;
    formError.value = null;
    try {
      await updateUserApi(id, payload);
      await fetchUserList();
      return true;
    } catch (error) {
      formError.value = extractErrorMessage(error, '사용자 수정에 실패했습니다');
      return false;
    } finally {
      formLoading.value = false;
    }
  }

  /** DELETE /api/v1/users/:id — soft delete 후 목록 refetch */
  async function deleteUser(id: string): Promise<boolean> {
    deleteLoadingId.value = id;
    deleteError.value = null;
    try {
      await deleteUserApi(id);
      await fetchUserList();
      return true;
    } catch (error) {
      deleteError.value = extractErrorMessage(error, '사용자 삭제에 실패했습니다');
      return false;
    } finally {
      deleteLoadingId.value = null;
    }
  }

  return {
    users,
    listLoading,
    listError,
    filtered,
    includeInactive,
    searchQuery,
    roleFilter,
    formLoading,
    formError,
    deleteLoadingId,
    deleteError,
    setSearch,
    setRoleFilter,
    setIncludeInactive,
    fetchUserList,
    updateUser,
    deleteUser,
  };
});
