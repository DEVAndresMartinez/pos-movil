import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { City, Country, Department } from "../interfaces/location";

@Injectable({
    providedIn: 'root'
})
export class LocationService {

    private baseUrl: string = environment.BASE_URL;

    constructor(private http: HttpClient) {}

    getCountry(): Observable<Country[]> {
        return this.http.get<Country[]>(`${this.baseUrl}/v1/country/all-countries-active`);
    }

    getDepartment(countryId: string): Observable<Department[]> {
        return this.http.get<Department[]>(`${this.baseUrl}/v1/departament/all-departaments-active/${countryId}`);
    }

    getCity(departamentId: string): Observable<City[]> {
        return this.http.get<City[]>(`${this.baseUrl}/v1/city/all-cities-active/${departamentId}`);
    }

}