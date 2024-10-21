import { MenuItem } from "primeng/api";
import { User } from "./user.interface";

export interface Client {
    id:             string;
    businessName:   string;
    nit:            string;
    userName:       string;
    cellPhone:      string;
    email:          string;
    status:         string;
    users?:         User[];
    createdAt?:     string;
    updatedAt?:     string;
    items?:         MenuItem[];
}

export interface CreateClient {
    id?:             string;
    businessName:   string;
    nit:            string;
    userName:       string;
    cellPhone:      string;
    email:          string;
    status:         string;
    users?:         User[];
    createdAt?:     string;
    updatedAt?:     string;
    items?:         MenuItem[];
}