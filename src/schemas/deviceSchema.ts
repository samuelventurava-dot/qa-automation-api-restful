export const deviceResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        data: {
            type: ["object", "null"],
            properties: {
                year: { type: "number" },
                price: { type: "number" },
                "CPU model": { type: "string" },
                "Hard disk size": { type: "string" },
                color: { type: "string" }
            }
        }
    },
    // Campos que estrictamente deben venir en la respuesta
    required: ["id", "name"],
    additionalProperties: true // Permite campos extras que el backend pueda agregar en el futuro sin romper la prueba
};