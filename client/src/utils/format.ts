export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDays(value: string | null | undefined): string {
  if (!value) return '-';
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  return `${days}일 전`;
}
