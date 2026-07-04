const PALETTE = ['#40916c', '#52b788', '#74c69d', '#2d6a4f', '#1b4332', '#95d5b2', '#b7e4c7', '#d8a48f'];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 네트워크 의존 없이 즉시 렌더링되는 SVG 데이터 URI 플레이스홀더 이미지를 생성한다.
 * seed로 색상을, label로 표시 텍스트를 결정한다.
 */
export function placeholderImage(seed: string, label = '🌵', size = 400): string {
  const color = PALETTE[hashCode(seed) % PALETTE.length];
  const darker = PALETTE[(hashCode(seed) + 3) % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${darker}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#g)"/>
    <text x="50%" y="50%" font-size="${Math.round(size * 0.28)}" text-anchor="middle" dominant-baseline="central">${escapeXml(label)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** QR 코드 자리를 대신하는 간단한 격자 패턴 SVG (실제 QR 라이브러리 없이 목업용) */
export function placeholderQr(seed: string, size = 200): string {
  const rng = mulberry32(hashCode(seed));
  const cells = 12;
  const cellSize = size / cells;
  let rects = '';
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const isFinder = (x < 3 && y < 3) || (x > cells - 4 && y < 3) || (x < 3 && y > cells - 4);
      const on = isFinder ? (x % 2 === 0 || y % 2 === 0) : rng() > 0.55;
      if (on) {
        rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1b1b1b"/>`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#ffffff"/>
    ${rects}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mulberry32(seed: number) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export { mulberry32, hashCode };
