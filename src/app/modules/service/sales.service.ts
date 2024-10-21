import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SalesService {

    private baseUrl: string = environment.BASE_URL;

    private saleId: string | null = null;

    constructor(private http: HttpClient) { }

    getSales(): Observable<any[]> {
        return this.http.get<{ sales: any[] }>(`${this.baseUrl}/v1/sales`).pipe(
            map(response => response.sales)
        );
    }

    getSaleById(saleId: string | null): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/v1/sales/${saleId}`);
    }

    validateSaleByCustomer(idCustomer: string): Observable<any[]> {
        return this.getSales().pipe(
            map(sales =>
                sales
                    .filter(sale => sale.status === 'CREATED' && sale.finalCustomer.identification === idCustomer)
            )
        );
    }

    validateStatus(): Observable<any[]> {
        return this.getSales().pipe(
            map(sale => 
                sale.filter(sale => sale.status === 'PAID'))
        );
    }

    createSale(sale: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/v1/sales`, sale);
    }

    addSaleDetails(saleId: string | null, details: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/v1/sales/${saleId}/add-detail-sales`, details);
    }

    updateSale(sale: any): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/v1/sales/${sale.id}`, sale);
    }

    updateSaleDetail(saleId: any, sale: any): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/v1/sales/${saleId}/update-sale-detail`, sale);
    }

    updateStatusSale(sale: any, body: any): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/v1/sales/${sale}/update-status-sale`, body);
    }

    deleteSaleDetail(saleId: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/v1/sales/${saleId}/remove-sale-detail`);
    }

    invoiceBody(saleId: string | null): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/v1/sales/${saleId}/invoice-body`);
    }

    downloadInvoicePdf(saleId: string | null): Observable<any> {
        return this.http.get(`${this.baseUrl}/v1/invoice-pdf/${saleId}/invoice-body`, { responseType: 'blob' });
    }

    setSaleId(id: string): void {
        this.saleId = id;
    }

    getSaleId(): string | null {
        return this.saleId;
    }

    clearSaleId(): void {
        this.saleId = null;
    }

}