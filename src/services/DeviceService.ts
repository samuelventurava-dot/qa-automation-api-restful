import { APIRequestContext, APIResponse } from '@playwright/test';
import { DevicePayload } from '../builders/DeviceBuilder';

export class DeviceService {
    private request: APIRequestContext;
    private collectionName = 'qa-automation-framework';
    private endpoint = `/collections/${this.collectionName}/objects`;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    private getHeaders(customApiKey?: string) {
        return {
            'x-api-key': customApiKey || process.env.API_KEY || ''
        };
    }

    // Crear dispositivo (POST)
    async createDevice(payload: DevicePayload): Promise<APIResponse> {
        return await this.request.post(this.endpoint, {
            headers: this.getHeaders(),
            data: payload
        });
    }

    // Consultar dispositivo (GET)
    async getDevice(id: string): Promise<APIResponse> {
        return await this.request.get(`${this.endpoint}/${id}`, {
            headers: this.getHeaders(),
        });
    }

    // Actualizar dispositivo completo (PUT)
    async updateDevice(id: string, payload: DevicePayload): Promise<APIResponse> {
        return await this.request.put(`${this.endpoint}/${id}`, {
            headers: this.getHeaders(),
            data: payload
        });
    }

    // Eliminar dispositivo (DELETE)
    async deleteDevice(id: string): Promise<APIResponse> {
        return await this.request.delete(`${this.endpoint}/${id}`, {
            headers: this.getHeaders(),
        });
    }
}