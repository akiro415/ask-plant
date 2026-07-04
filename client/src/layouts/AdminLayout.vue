<script setup lang="ts">
import AdminSidebar from '@/components/layout/AdminSidebar.vue';
import AdminHeader from '@/components/layout/AdminHeader.vue';
import Breadcrumb from '@/components/layout/Breadcrumb.vue';
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-main">
      <AdminHeader />
      <Breadcrumb />
      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
