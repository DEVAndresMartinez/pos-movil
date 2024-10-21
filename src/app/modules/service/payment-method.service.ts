import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { PaymentMethod} from "../interfaces/payment-method";
import { environment } from "environments/environment";

@Injectable({
    providedIn: 'root'
})
export class PaymentMethodService {

    private baseUrl: string = environment.BASE_URL;


    constructor(private http: HttpClient) {}

    getPaymentMethods(): Observable<PaymentMethod[]>  {
        return this.http.get<PaymentMethod[]>(`${this.baseUrl}/v1/payment-method/status`);
    }
}