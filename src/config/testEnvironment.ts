export const testEnvironment = {
  get baseUrl() {
    return process.env.BASE_URL || 'https://api.restful-api.dev';
  },
  get authMode() {
    return process.env.AUTH_MODE || 'apiKey';
  },
  get collectionName() {
    return process.env.COLLECTION_NAME || 'qa-automation-framework';
  },
};
