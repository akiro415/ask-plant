import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    { path: '/', redirect: '/admin/dashboard' },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/admin/dashboard' },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
          meta: { title: 'Dashboard', breadcrumb: ['Dashboard'] },
        },
        {
          path: 'species',
          name: 'admin-species-list',
          component: () => import('@/views/admin/species/SpeciesListView.vue'),
          meta: { title: '품종관리', breadcrumb: ['품종관리'] },
        },
        {
          path: 'species/:id',
          name: 'admin-species-detail',
          component: () => import('@/views/admin/species/SpeciesDetailView.vue'),
          meta: { title: '품종 상세', breadcrumb: ['품종관리', '품종 상세'] },
        },
        {
          path: 'plants',
          name: 'admin-plant-list',
          component: () => import('@/views/admin/plants/PlantListView.vue'),
          meta: { title: '개체관리', breadcrumb: ['개체관리'] },
        },
        {
          path: 'plants/:id',
          name: 'admin-plant-detail',
          component: () => import('@/views/admin/plants/PlantDetailView.vue'),
          meta: { title: '개체 상세', breadcrumb: ['개체관리', '개체 상세'] },
        },
        {
          path: 'locations',
          name: 'admin-location-list',
          component: () => import('@/views/admin/locations/LocationListView.vue'),
          meta: { title: '위치관리', breadcrumb: ['위치관리'] },
        },
        {
          path: 'photos',
          name: 'admin-photo-list',
          component: () => import('@/views/admin/photos/PhotoListView.vue'),
          meta: { title: '사진관리', breadcrumb: ['사진관리'] },
        },
        {
          path: 'qr',
          name: 'admin-qr-list',
          component: () => import('@/views/admin/qr/QrListView.vue'),
          meta: { title: 'QR관리', breadcrumb: ['QR관리'] },
        },
        {
          path: 'common-codes',
          name: 'admin-common-codes',
          component: () => import('@/views/admin/common-codes/CommonCodeListView.vue'),
          meta: { title: '공통코드', breadcrumb: ['공통코드'] },
        },
        {
          path: 'users',
          name: 'admin-user-list',
          component: () => import('@/views/admin/users/UserListView.vue'),
          meta: { title: '사용자관리', breadcrumb: ['사용자관리'] },
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/views/admin/settings/SettingsView.vue'),
          meta: { title: '설정', breadcrumb: ['설정'] },
        },
      ],
    },
    {
      path: '/p',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', name: 'public-showcase', component: () => import('@/views/public/PublicShowcaseView.vue') },
        { path: ':qrCode', name: 'public-plant-detail', component: () => import('@/views/public/PublicPlantView.vue') },
      ],
    },
    {
      path: '/cart',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [{ path: '', name: 'public-cart', component: () => import('@/views/public/PublicCartView.vue') }],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/admin/dashboard',
    },
  ],
});

export default router;
