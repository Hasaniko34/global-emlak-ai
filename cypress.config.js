const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3004',
    setupNodeEvents(on, config) {
      // e2e test olaylarını yapılandır
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
}); 