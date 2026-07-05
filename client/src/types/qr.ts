/** GET /qr/list 응답 항목 */
export interface QrListItem {
  plantId: string;
  qrCode: string;
  nickname: string | null;
  speciesDisplayName: string;
  categoryCode: string;
  status: { code: string; name: string };
  publicPath: string;
  issuedAt: string;
}

/** GET /qr/preview/:plantId 응답 */
export interface QrPreview {
  plantId: string;
  qrCode: string;
  categoryCode: string;
  sequenceNumber: string;
  nickname: string | null;
  speciesDisplayName: string;
  status: { code: string; name: string };
  publicPath: string;
}
