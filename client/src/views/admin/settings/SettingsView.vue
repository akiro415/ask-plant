<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue';
</script>

<template>
  <div>
    <PageHeader title="설정" subtitle="시스템 기본 값을 설정합니다. (Mock 화면 — 저장되지 않습니다)" />

    <div class="settings-grid">
      <section class="panel">
        <h2 class="info-card-title">기본 정보</h2>
        <label class="form-field">
          <span>농장/매장 이름</span>
          <input type="text" value="Ask Plant 다육 컬렉션" />
        </label>
        <label class="form-field">
          <span>관리자 이메일</span>
          <input type="email" value="admin@askplant.com" />
        </label>
      </section>

      <section class="panel">
        <h2 class="info-card-title">QR / 라벨</h2>
        <label class="form-field">
          <span>QR 코드 자릿수</span>
          <input type="number" value="6" />
        </label>
        <label class="form-field">
          <span>라벨 용지 규격</span>
          <select>
            <option>40mm x 30mm</option>
            <option>50mm x 30mm</option>
            <option>60mm x 40mm</option>
          </select>
        </label>
      </section>

      <section class="panel">
        <h2 class="info-card-title">알림</h2>
        <label class="form-checkbox"><input type="checkbox" checked disabled /> 신규 주문/문의 알림 받기</label>
        <label class="form-checkbox"><input type="checkbox" checked disabled /> 재고 부족 알림 받기</label>
        <label class="form-checkbox"><input type="checkbox" disabled /> 주간 리포트 이메일 받기</label>
      </section>
    </div>

    <div class="settings-save-bar">
      <button type="button" class="btn btn-primary" disabled title="Mock 화면에서는 비활성화됩니다">저장</button>
    </div>
  </div>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.info-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.9rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-bottom: 0.9rem;
}

.form-field input,
.form-field select {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--color-text);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  margin-bottom: 0.6rem;
  color: var(--color-text);
}

.settings-save-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
