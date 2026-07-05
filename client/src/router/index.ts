import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { UserRole } from '@/types/user';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '로그인' },
    },
    { path: '/', redirect: () => (localStorage.getItem('ask-plant.accessToken') ? '/admin/dashboard' : '/p') },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      // 하위 라우트 전체에 적용되는 인증 요구사항 — /admin/* 진입 시 로그인 필요.
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
          meta: { title: 'Dashboard', breadcrumb: ['Dashboard'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'species',
          name: 'admin-species-list',
          component: () => import('@/views/admin/species/SpeciesListView.vue'),
          meta: { title: '품종관리', breadcrumb: ['품종관리'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'species/:id',
          name: 'admin-species-detail',
          component: () => import('@/views/admin/species/SpeciesDetailView.vue'),
          meta: { title: '품종 상세', breadcrumb: ['품종관리', '품종 상세'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'plants',
          name: 'admin-plant-list',
          component: () => import('@/views/admin/plants/PlantListView.vue'),
          meta: { title: '개체관리', breadcrumb: ['개체관리'], isMock: false },
        },
        {
          path: 'plants/new',
          name: 'admin-plant-create',
          component: () => import('@/views/admin/plants/PlantCreateView.vue'),
          meta: { title: '개체 등록', breadcrumb: ['개체관리', '개체 등록'], isMock: false },
        },
        {
          path: 'plants/:id',
          name: 'admin-plant-detail',
          component: () => import('@/views/admin/plants/PlantDetailView.vue'),
          meta: { title: '개체 상세', breadcrumb: ['개체관리', '개체 상세'], isMock: false },
        },
        {
          path: 'locations',
          name: 'admin-location-list',
          component: () => import('@/views/admin/locations/LocationListView.vue'),
          meta: { title: '위치관리', breadcrumb: ['위치관리'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'locations/:id',
          name: 'admin-location-detail',
          component: () => import('@/views/admin/locations/LocationDetailView.vue'),
          meta: { title: '위치 상세', breadcrumb: ['위치관리', '위치 상세'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'photos',
          name: 'admin-photo-list',
          component: () => import('@/views/admin/photos/PhotoListView.vue'),
          meta: { title: '사진관리', breadcrumb: ['사진관리'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'qr',
          name: 'admin-qr-list',
          component: () => import('@/views/admin/qr/QrListView.vue'),
          meta: { title: 'QR관리', breadcrumb: ['QR관리'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'qr/:plantId',
          name: 'admin-qr-detail',
          component: () => import('@/views/admin/qr/QrDetailView.vue'),
          meta: { title: 'QR 상세', breadcrumb: ['QR관리', 'QR 상세'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'common-codes',
          name: 'admin-common-codes',
          component: () => import('@/views/admin/common-codes/CommonCodeListView.vue'),
          meta: { title: '공통코드', breadcrumb: ['공통코드'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
        {
          path: 'users',
          name: 'admin-user-list',
          component: () => import('@/views/admin/users/UserListView.vue'),
          meta: { title: '사용자관리', breadcrumb: ['사용자관리'], isMock: false, roles: ['ADMIN'] as UserRole[] },
        },
        {
          path: 'users/:id',
          name: 'admin-user-detail',
          component: () => import('@/views/admin/users/UserDetailView.vue'),
          meta: { title: '사용자 상세', breadcrumb: ['사용자관리', '사용자 상세'], isMock: false, roles: ['ADMIN'] as UserRole[] },
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/views/admin/settings/SettingsView.vue'),
          meta: { title: '설정', breadcrumb: ['설정'], isMock: false, roles: ['ADMIN', 'STAFF'] as UserRole[] },
        },
      ],
    },
    {
      path: '/p',
      component: () => import('@/layouts/PublicLayout.vue'),
      meta: { isMock: false },
      children: [
        { path: '', name: 'public-showcase', component: () => import('@/views/public/PublicShowcaseView.vue'), meta: { isMock: false } },
        { path: ':qrCode', name: 'public-plant-detail', component: () => import('@/views/public/PublicPlantView.vue'), meta: { isMock: false } },
      ],
    },
    {
      path: '/cart',
      component: () => import('@/layouts/PublicLayout.vue'),
      meta: { isMock: false },
      children: [{ path: '', name: 'public-cart', component: () => import('@/views/public/PublicCartView.vue'), meta: { isMock: false } }],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/admin/dashboard',
    },
  ],
});

/**
 * /admin/* 등 meta.requiresAuth가 걸린 라우트는 로그인(JWT 보유) 상태에서만 진입할 수 있다.
 * useAuthStore()는 가드 콜백 내부에서 호출한다 — Pinia가 활성화되기 전에(모듈 최상단에서)
 * 스토어를 생성하면 "getActivePinia was called with no active Pinia" 오류가 발생하기 때문이다.
 *
 * 인증 확인은 2단계로 이루어진다:
 *  1) 토큰 존재 여부 — localStorage에 토큰이 없으면 즉시 /login
 *  2) 토큰 유효성 — 최초 진입(새로고침 포함) 시에는 auth.meChecked가 false이므로
 *     GET /auth/me로 토큰을 서버에 검증하고 최신 사용자 정보를 받아온 뒤 통과시킨다.
 *     (이후 네비게이션은 meChecked가 true라 매번 재검증하지 않는다 — 401은 axios 인터셉터가 별도로 처리)
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.path === '/login' && auth.isAuthenticated) {
    return { path: auth.defaultAdminPath };
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  if (!requiresAuth) return true;

  if (!auth.token) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  if (!auth.meChecked) {
    const valid = await auth.fetchMe();
    if (!valid) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }
  }

  // role 기반 확장 지점: 라우트 meta에 roles: UserRole[]를 지정하면 해당 role만 통과한다.
  // 현재는 어떤 /admin 라우트도 roles를 지정하지 않아 전체 로그인 사용자가 접근 가능하다.
  const allowedRoles = to.matched.flatMap((record) => (record.meta.roles as UserRole[] | undefined) ?? []);
  if (allowedRoles.length > 0 && !auth.hasRole(...allowedRoles)) {
    return { path: auth.defaultAdminPath };
  }

  return true;
});

export default router;
