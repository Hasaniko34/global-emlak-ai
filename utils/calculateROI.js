/**
 * Yatırım getiri oranını (ROI) hesaplar
 * @param {number} cost - Gayrimenkulün maliyeti (TRY)
 * @param {number} annualRent - Yıllık kira geliri (TRY)
 * @returns {number} - Yüzde olarak ROI değeri
 */
export function calculateROI(cost, annualRent) {
  if (cost === 0) return 0;
  return (annualRent / cost) * 100;
} 