
export interface Unit {
    id:             string;
    name:           string;
    abbreviation:   string;
    clientId:       string;
    status:         boolean;
}
export interface UnitCreate {
    id?:             string;
    name?:           string;
    abbreviation?:   string;
    clientId?:       string;
    status?:         boolean;
}