import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type AuthMode = 'apiKey' | 'bearer' | 'none';

export const apiConfig = {
  baseUrl: process.env.BASE_URL || 'https://api.restful-api.dev',
  collectionName: process.env.COLLECTION_NAME || 'qa-automation-framework',
  authMode: (process.env.AUTH_MODE as AuthMode) || 'apiKey',
  apiKey: process.env.API_KEY || '',
  bearerToken: process.env.BEARER_TOKEN || '',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 15000),
  retryAttempts: Number(process.env.RETRY_ATTEMPTS || 3),
  retryDelayMs: Number(process.env.RETRY_DELAY_MS || 1000),
} as const;

export const apiEndpoints = {
  root: `/collections/${apiConfig.collectionName}/objects`,
  byId: (id: string) => `/collections/${apiConfig.collectionName}/objects/${id}`,
};
