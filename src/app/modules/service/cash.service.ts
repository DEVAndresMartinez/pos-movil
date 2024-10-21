import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CashService {
    
    private baseUrl: string = environment.BASE_URL;

    constructor(private http: HttpClient) { }

    getAllCash():Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/v1/cash-closing`);
    }

    openCash(openingBalance: number): Observable<any> {
        const body = { openingBalance };
        return this.http.post<any>(`${this.baseUrl}/v1/cash-closing`, body);
    }

    getPreCloseCash(idCash: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/v1/cash-closing/pre-cash-closing/${idCash}`);
    }

    closeCash(closingBalance: number, observations: string, idCash: string): Observable<any> {
        const body = { closingBalance, observations };
        return this.http.patch<any>(`${this.baseUrl}/v1/cash-closing/${idCash}`, body);
    }

    downloadCash(cashId: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/v1/cash-closing/download-report/${cashId}`, { responseType: 'blob' });
    }

}