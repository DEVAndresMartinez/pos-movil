import { Unit } from "./units.interface";

export interface Ingredients {
    id:                 string;
    name:               string;
    description:        string;
    sku:                string;
    unit:               Unit;
    status:             boolean;
    clientId:           string;
}

export interface IngredientsCreate {
    id?:                 string;
    name?:               string;
    description?:        string;
    sku?:                string;
    unitId?:             string;
    unit?:               Unit;
    status?:             boolean;
    clientId?:           string;
}