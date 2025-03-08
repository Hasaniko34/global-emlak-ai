describe('Emlak Değerleme Sayfası', () => {
  beforeEach(() => {
    // Her test öncesi değerleme sayfasını ziyaret et
    cy.visit('/evaluate');
  });

  it('Değerleme formunu doldurabilmeli ve sonuç alabilmeli', () => {
    // Form alanlarını doldur
    cy.get('[data-testid="property-type-input"]').type('Daire');
    cy.get('[data-testid="location-input"]').type('İstanbul, Kadıköy');
    cy.get('[data-testid="size-input"]').type('120');
    cy.get('[data-testid="rooms-input"]').type('3');
    
    // Formu gönder
    cy.get('[data-testid="submit-button"]').click();
    
    // API yanıtını bekle ve sonuçların gösterildiğini doğrula
    cy.contains('Tahmini Değerleme Sonucu', { timeout: 10000 }).should('be.visible');
    cy.contains('İstanbul, Kadıköy').should('be.visible');
  });

  it('Eksik form alanları için doğrulama mesajları göstermeli', () => {
    // Boş formu göndermeye çalış
    cy.get('[data-testid="submit-button"]').click();
    
    // HTML5 doğrulama mesajlarını kontrol et
    // Not: Cypress HTML5 doğrulama mesajlarını doğrudan yakalayamaz,
    // bu nedenle required özelliğinin varlığını kontrol ediyoruz
    cy.get('[data-testid="property-type-input"]').should('have.attr', 'required');
    cy.get('[data-testid="location-input"]').should('have.attr', 'required');
    cy.get('[data-testid="size-input"]').should('have.attr', 'required');
    cy.get('[data-testid="rooms-input"]').should('have.attr', 'required');
  });

  it('API hatası durumunda hata mesajı göstermeli', () => {
    // API'yi engelleyerek hata durumunu simüle et
    cy.intercept('POST', '/api/evaluate', {
      statusCode: 500,
      body: { success: false, error: 'Sunucu hatası' }
    }).as('evaluateError');
    
    // Form alanlarını doldur
    cy.get('[data-testid="property-type-input"]').type('Daire');
    cy.get('[data-testid="location-input"]').type('İstanbul, Kadıköy');
    cy.get('[data-testid="size-input"]').type('120');
    cy.get('[data-testid="rooms-input"]').type('3');
    
    // Formu gönder
    cy.get('[data-testid="submit-button"]').click();
    
    // API çağrısının yapıldığını doğrula
    cy.wait('@evaluateError');
    
    // Hata mesajının gösterildiğini doğrula
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
}); 