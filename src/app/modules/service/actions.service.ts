import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ActionsService {

    private baseUrl: string = environment.BASE_URL;


    constructor(private http: HttpClient) { }

    getUserAction(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/v1/user-action`);
    }

    addUserActions(body: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/v1/user-action`, body);
    }
    
    addUserActionsPermissions(userActionsId: string, permissionIds: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/v1/user-action/${userActionsId}/assign-permission-to-user-action`, permissionIds);
    }

}