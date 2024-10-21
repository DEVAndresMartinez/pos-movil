import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PrintService {

private baseUrl = 'http://192.168.1.150:8080/print';
;

  constructor(private http: HttpClient) {}

  printTicket(printContent: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      printContent
    };

    return this.http.post<any>(this.baseUrl, body, { headers });
  }
}