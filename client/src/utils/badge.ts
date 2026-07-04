const TONE_MAP: Record<string, 'green' | 'blue' | 'orange' | 'gray' | 'red'> = {
  FOR_SALE: 'green',
  IN_STOCK: 'blue',
  RESERVED: 'orange',
  SOLD: 'gray',
  DISCARDED: 'red',
};

export function statusTone(code: string): 'green' | 'blue' | 'orange' | 'gray' | 'red' {
  return TONE_MAP[code] ?? 'gray';
}
