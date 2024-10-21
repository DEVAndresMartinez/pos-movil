import { MenuItem } from "primeng/api";
import { Role } from "./role.interface";

export interface User {
    id:             string;
    email:          string;
    firstName:      string;
    lastName:       string;
    roles?:          Role[];
    cellPhone?:     string;
    branch?:        string[];
    status?:        string;
    clientId?:      string | null;
    clientStatus?:  string;
    items?:         MenuItem[];
  }

  export interface UserCreate {
      id?:        string;
      email:      string;
      firstName:  string;
      lastName:   string;
      roles?:      Role[] | string[];
      roleIds:      Role[] | string[];
      cellPhone?: string;
      branch?:    string[];
      status:     string;
      clientId?:      string | null;
      clientStatus?:  string;
      password?:   string;
    }
