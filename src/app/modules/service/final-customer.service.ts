import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { FinalCutomerCreate } from "../interfaces/final-customer";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FinalCustomerService {
    
    private baseUrl: string = environment.BASE_URL;

    constructor(private http: HttpClient) { }

    addFinalCustomer(finalCustomer: FinalCutomerCreate): Observable<any> {
        const finalCustomers = { ...finalCustomer};
        return this.http.post<any>(`${this.baseUrl}/v1/final-customers`, finalCustomers);
    }

    getByIdentification(identifier: number): Observable<any>{
        return this.http.get<any>(`${this.baseUrl}/v1/final-customers/identification/${identifier}`);
    }

    getIdentificationType(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/v1/identification-type`);
    }

}
