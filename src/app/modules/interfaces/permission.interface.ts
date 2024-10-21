// export interface Permission {
//     id:             string;
//     name:           string;
//     slug:           string;
//     userActions:    any;
//     checkStatus?:   boolean;
//     createdAt:      string;
//     updatedAt:      string;
// }

export interface Permission {
    id:             string;
    name:           string;
    slug:           string;
    model:          string;
    checkStatus?:   boolean;
    createdAt:      string;
    updatedAt:      string;
}