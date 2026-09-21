import { APIRequestContext, APIResponse } from '@playwright/test';
import { DevicePayload } from '../builders/DeviceBuilder';
import { Logger } from '../../utils/logger';
import { apiConfig, apiEndpoints } from '../config/apiConfig';
import { getErrorSummary, safeJsonParse, shouldRetry } from '../../utils/apiErrorHandler';

export class DeviceService {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    private getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        switch (apiConfig.authMode) {
            case 'bearer':
                headers.Authorization = `Bearer ${apiConfig.bearerToken}`;
                break;
            case 'apiKey':
                headers['x-api-key'] = apiConfig.apiKey;
                break;
            default:
                break;
        }

        return headers;
    }

    private async parseResponseBody(response: APIResponse): Promise<Record<string, unknown>> {
        const rawText = await response.text();

        if (!rawText) return {};

        const parsed = safeJsonParse<Record<string, unknown>>(rawText);
        if (parsed) return parsed;

        Logger.warn('[RESPONSE PARSE WARN]', {
            status: response.status(),
            statusText: response.statusText(),
            rawBody: rawText.slice(0, 500),
        });

        return { rawBody: rawText.slice(0, 500) };
    }

    private async waitBeforeRetry(attempt: number) {
        const delay = apiConfig.retryDelayMs * attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    private async executeWithRetry(
        method: string,
        url: string,
        options: { headers: Record<string, string>; data?: unknown },
        requestAction: () => Promise<APIResponse>,
        maxRetries: number = apiConfig.retryAttempts
    ): Promise<APIResponse> {
        let attempt = 0;
        let lastError: unknown;

        Logger.info(`[REQUEST] ${method} ${url}`, {
            headers: options.headers,
            body: options.data,
        });

        while (attempt < maxRetries) {
            try {
                const startTime = Date.now();
                const response = await requestAction();
                const duration = Date.now() - startTime;
                const responseBody = await this.parseResponseBody(response);

                if (shouldRetry(response.status())) {
                    Logger.error(`[REINTENTO ${attempt + 1}] Error del servidor o timeout`, {
                        method,
                        url,
                        status: response.status(),
                        statusText: response.statusText(),
                        duration,
                        responseBody,
                    });
                    attempt++;
                    await this.waitBeforeRetry(attempt);
                    continue;
                }

                if (response.status() >= 400) {
                    Logger.warn(`[HTTP ${response.status()}] Respuesta con error esperado`, {
                        method,
                        url,
                        responseBody,
                        headers: response.headers(),
                        duration,
                    });
                }

                Logger.info(`[RESPONSE] ${response.status()} ${response.statusText()} (${duration}ms)`, {
                    headers: response.headers(),
                    body: responseBody,
                });

                return response;
            } catch (error: unknown) {
                lastError = error;
                Logger.error(`[NETWORK ERROR] Intento ${attempt + 1}`, {
                    method,
                    url,
                    error: getErrorSummary(error),
                });
                attempt++;
                await this.waitBeforeRetry(attempt);
            }
        }

        throw new Error(`Fallo crítico de API. Último error: ${getErrorSummary(lastError).message}`);
    }

    async createDevice(payload: DevicePayload): Promise<APIResponse> {
        const options = { headers: this.getHeaders(), data: payload };
        return await this.executeWithRetry('POST', apiEndpoints.root, options, () =>
            this.request.post(apiEndpoints.root, options)
        );
    }

    async getDevice(id: string): Promise<APIResponse> {
        const options = { headers: this.getHeaders() };
        const url = apiEndpoints.byId(id);
        return await this.executeWithRetry('GET', url, options, () =>
            this.request.get(url, options)
        );
    }

    async updateDevice(id: string, payload: DevicePayload): Promise<APIResponse> {
        const options = { headers: this.getHeaders(), data: payload };
        const url = apiEndpoints.byId(id);
        return await this.executeWithRetry('PUT', url, options, () =>
            this.request.put(url, options)
        );
    }

    async deleteDevice(id: string): Promise<APIResponse> {
        const options = { headers: this.getHeaders() };
        const url = apiEndpoints.byId(id);
        return await this.executeWithRetry('DELETE', url, options, () =>
            this.request.delete(url, options)
        );
    }
}