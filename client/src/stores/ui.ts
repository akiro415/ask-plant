import { defineStore } from 'pinia';
import { ref } from 'vue';

const MOBILE_BREAKPOINT = 860;

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

/** Breadcrumb의 마지막 항목처럼 라우트 메타만으로 표현할 수 없는 동적 정보(예: QR코드)를 담는다. */
export const useUiStore = defineStore('ui', () => {
  const breadcrumbExtra = ref<string | null>(null);
  /** PC: 사이드바 접힘 */
  const sidebarCollapsed = ref(false);
  /** 모바일: drawer 열림 */
  const sidebarMobileOpen = ref(false);

  function setBreadcrumbExtra(value: string | null) {
    breadcrumbExtra.value = value;
  }

  function toggleSidebar() {
    if (isMobileViewport()) {
      sidebarMobileOpen.value = !sidebarMobileOpen.value;
    } else {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    }
  }

  function closeMobileSidebar() {
    sidebarMobileOpen.value = false;
  }

  return {
    breadcrumbExtra,
    sidebarCollapsed,
    sidebarMobileOpen,
    setBreadcrumbExtra,
    toggleSidebar,
    closeMobileSidebar,
  };
});
