import Ajv from 'ajv';

// Inicializamos Ajv con opciones estrictas
const ajv = new Ajv({ allErrors: true });

/**
 * Valida un objeto JSON contra un esquema definido
 * @param schema Esquema JSON de referencia
 * @param data Objeto de respuesta de la API
 * @returns Un objeto con el resultado booleano y el detalle del error si falla
 */
export function validateJsonSchema(schema: object, data: any): { isValid: boolean; errors: string } {
    const validate = ajv.compile(schema);
    const isValid = validate(data);
    const errors = validate.errors ? ajv.errorsText(validate.errors) : 'No errors';
    
    return { isValid: isValid as boolean, errors };
}