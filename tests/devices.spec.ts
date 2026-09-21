import { test, expect } from '@playwright/test';
import { DeviceService } from '../src/services/DeviceService';
import { DeviceBuilder } from '../src/builders/DeviceBuilder';
import { deviceResponseSchema } from '../src/schemas/deviceSchema';
import { validateJsonSchema } from '../utils/jsonValidator';

// Grupo de pruebas para los endpoints de Devices
test.describe('API Restful-API.dev - Endpoints de Dispositivos', () => {
    
    let deviceService: DeviceService;

    // Instanciamos el servicio antes de cada test para mantener el contexto limpio
    test.beforeEach(async ({ request }) => {
        deviceService = new DeviceService(request);
    });

    test('CP01: POST - Debería crear un dispositivo y cumplir con el SLA y Schema', async () => {
        // 1. Arrange: Construimos un payload dinámico usando el Patrón Builder
        const payload = new DeviceBuilder()
            .withName('MacBook Pro M5 - QA Edition')
            .withData({ year: 2026, price: 3000, color: 'Space Black' })
            .build();

        // 2. Act: Ejecutamos la petición midiendo el tiempo (SLA)
        const startTime = Date.now();
        const response = await deviceService.createDevice(payload);
        const duration = Date.now() - startTime;
        
        const responseBody = await response.json();
        console.log('Response Body Completo:', JSON.stringify(responseBody, null, 2));

        // 3. Assert: Validamos Status Code, SLA, Headers y Estructura
        expect(response.status()).toBe(200);
        expect(duration, `El tiempo de respuesta fue ${duration}ms, superior al SLA de 2000ms`).toBeLessThan(2000);
        expect(response.headers()['content-type']).toContain('application/json');
        
        // Validación estricta del Schema (Integridad)
        const schemaValidation = validateJsonSchema(deviceResponseSchema, responseBody);

        // Cambio clave: Comparamos el texto del error, no el booleano
        expect(schemaValidation.errors, 'El JSON no cumple con el esquema esperado').toBe('No errors');
        
        // Validación de la data
        expect(responseBody.name).toBe(payload.name);
        expect(responseBody.data.year).toBe(2026);
    });

    test('CP02: GET - Debería consultar un dispositivo existente correctamente', async () => {
        // Setup aisalado: Creamos un dispositivo rápido para este test
        const baseDevice = new DeviceBuilder().build();
        const createRes = await deviceService.createDevice(baseDevice);
        const createdDeviceId = (await createRes.json()).id;

        // Act
        const response = await deviceService.getDevice(createdDeviceId);
        const responseBody = await response.json();

        // Assert
        expect(response.ok()).toBeTruthy();
        expect(responseBody.id).toBe(createdDeviceId);
        expect(responseBody.name).toBe(baseDevice.name);
    });

    test('CP03: PUT - Debería actualizar los datos de un dispositivo', async () => {
        // Setup aislado
        const baseDevice = new DeviceBuilder().build();
        const createRes = await deviceService.createDevice(baseDevice);
        const createdDeviceId = (await createRes.json()).id;

        // Arrange: Modificamos el payload para la actualización
        const updatePayload = new DeviceBuilder()
            .withName('Dispositivo Actualizado')
            .withData({ price: 9999 })
            .build();

        // Act
        const updateResponse = await deviceService.updateDevice(createdDeviceId, updatePayload);
        const updateBody = await updateResponse.json();

        // Assert
        expect(updateResponse.status()).toBe(200);
        expect(updateBody.name).toBe('Dispositivo Actualizado');
        expect(updateBody.data.price).toBe(9999);
    });

    test('CP04: DELETE - Debería eliminar un dispositivo y retornar mensaje de éxito', async () => {
        // Setup aislado
        const baseDevice = new DeviceBuilder().withName('To Be Deleted').build();
        const createRes = await deviceService.createDevice(baseDevice);
        const createdDeviceId = (await createRes.json()).id;

        // Act
        const deleteResponse = await deviceService.deleteDevice(createdDeviceId);
        const deleteBody = await deleteResponse.json();

        // Assert
        expect(deleteResponse.status()).toBe(200);
        expect(deleteBody.message).toContain(`Object with id = ${createdDeviceId} has been deleted`);
    });

    test('CP05: EXCEPCIÓN - Debería retornar 404 al consultar un dispositivo inexistente', async () => {
        // Arrange: Un ID que sabemos que no existe
        const invalidId = 'id-invalido-qa-99999';

        // Act
        const response = await deviceService.getDevice(invalidId);
        const responseBody = await response.json();

        // Assert: Validamos que la API maneje el error correctamente sin colgarse
        expect(response.status()).toBe(404);
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toContain(`Object with id=${invalidId} was not found`);
    });
});