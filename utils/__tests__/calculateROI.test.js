import { calculateROI } from '../calculateROI';

describe('ROI Hesaplama Fonksiyonu', () => {
  test('geçerli girdiler için ROI değerini doğru hesaplar', () => {
    const roi = calculateROI(200000, 20000); // maliyet = 200000, yıllık kira = 20000
    expect(roi).toBe(10); // %10 getiri
  });

  test('maliyet 0 olduğunda 0 döndürür', () => {
    const roi = calculateROI(0, 15000);
    expect(roi).toBe(0);
  });

  test('negatif değerler için de doğru hesaplama yapar', () => {
    const roi = calculateROI(500000, 25000);
    expect(roi).toBe(5); // %5 getiri
  });

  test('ondalıklı sonuçları doğru hesaplar', () => {
    const roi = calculateROI(300000, 18500);
    expect(roi).toBeCloseTo(6.17, 2); // %6.17 getiri, 2 ondalık basamak hassasiyetle
  });
}); 