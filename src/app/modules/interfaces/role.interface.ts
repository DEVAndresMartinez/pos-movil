import { MenuItem } from "primeng/api";
import { Permission } from "./permission.interface";


export interface Role {
    id:             string;
    name:           string;
    slug:           string;
    permissions:    Permission[] ;
    clientId?:      string | null;
    createdAt?:     string;
    updatedAt?:     string;
    items?:         MenuItem[];
}
export interface RoleCreate { 
    id?:            string;
    name:           string;
    clientId:       string | null;
}