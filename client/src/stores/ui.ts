import { defineStore } from 'pinia';
import { ref } from 'vue';

/** Breadcrumb의 마지막 항목처럼 라우트 메타만으로 표현할 수 없는 동적 정보(예: QR코드)를 담는다. */
export const useUiStore = defineStore('ui', () => {
  const breadcrumbExtra = ref<string | null>(null);
  const sidebarCollapsed = ref(false);

  function setBreadcrumbExtra(value: string | null) {
    breadcrumbExtra.value = value;
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  return { breadcrumbExtra, sidebarCollapsed, setBreadcrumbExtra, toggleSidebar };
});
