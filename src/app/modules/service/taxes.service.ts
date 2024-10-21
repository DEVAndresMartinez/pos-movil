import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Taxes, TaxesType } from "../interfaces/taxes";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class TaxesService {

    private baseUrl: string = environment.BASE_URL;

    constructor(private http: HttpClient) {}

    getTaxes(): Observable<Taxes[]> {
        return this.http.get<Taxes[]>(`${this.baseUrl}/v1/taxes`);
    }

    getTypeTaxes(): Observable<TaxesType[]> {
        return this.http.get<TaxesType[]>(`${this.baseUrl}/v1/taxes`);
    }

}