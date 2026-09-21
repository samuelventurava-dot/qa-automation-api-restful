export interface DeviceData {
    year?: number;
    price?: number;
    "CPU model"?: string;
    "Hard disk size"?: string;
    color?: string;
}

export interface DevicePayload {
    name: string;
    data?: DeviceData;
}

export class DeviceBuilder {
    private payload: DevicePayload;

    constructor() {
        this.payload = {
            name: "MacBook Pro",
            data: {
                year: 2026,
                price: 2499,
                "CPU model": "Apple M5 Pro",
                "Hard disk size": "1 TB"
            }
        };
    }

    withName(name: string): DeviceBuilder {
        this.payload.name = name;
        return this;
    }

    withData(data: DeviceData): DeviceBuilder {
        // Fusionamos los datos existentes con los nuevos usando spread operator
        this.payload.data = { ...this.payload.data, ...data };
        return this;
    }

    build(): DevicePayload {
        return this.payload;
    }
}