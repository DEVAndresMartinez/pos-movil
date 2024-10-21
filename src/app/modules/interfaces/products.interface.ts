import { Unit } from "./units.interface";

export interface Products {
    id: string;
    name: string;
    description: string;
    sku: string;
    clientId: string;
    unit: Unit;
    status: boolean;
    price: number;
    actualQuantity: number;
    minQuantity: number;
    ean: string;
    ingredient: any;
}

export interface ProductsCreate {
    id?: string;
    name?: string,
    description?: string,
    sku?: string,
    unitId?: string,
    status?: boolean,
    price?: number,
    actualQuantity?: number,
    minQuantity?: number,
    ean?: string;
    ingredient: {
        id?: string,
        name?: string,
        description?: string,
        sku?: string,
        clientId?: string,
        unitId?: string,
        status?: boolean,
        createdAt?: string,
        updatedAt?: string,
        unit?: {
            id?: string,
            name?: string,
            abbreviation?: string,
            clientId?: string,
            status?: boolean,
            createdAt?: string,
            updatedAt?: string,
        }
    }
}

export interface UpdateProducts {
    id?: string,
    name?: string,
    description?: string,
    sku?: string,
    unitId?: string,
    price?: number,
    minQuantity?: number,
    ean?: string;
    ingredient: {
        id?: string,
        name?: string,
        description?: string,
        sku?: string,
        clientId?: string,
        unitId?: string,
        status?: boolean,
        createdAt?: string,
        updatedAt?: string,
        unit?: {
            id?: string,
            name?: string,
            abbreviation?: string,
            clientId?: string,
            status?: boolean,
            createdAt?: string,
            updatedAt?: string,
        }
    }
}