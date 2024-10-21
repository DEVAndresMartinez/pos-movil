import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, map } from 'rxjs';
import { Products, ProductsCreate } from '../interfaces/products.interface';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private baseUrl: string = environment.BASE_URL;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Products[]> {
    return this.http.get<Products[]>(`${this.baseUrl}/v1/stocktaking`);
  }

  validateSku(sku: string): Observable<boolean> {
    return this.getProducts().pipe(
      map(
        products => products
        .filter(product => product.status === true)
        .some(product => product.ingredient.sku === sku)
      )
    );
  }

  validateEan(ean: string): Observable<boolean> {
    return this.getProducts().pipe(
      map(
        products => products.some(product => product.ingredient.ean === ean && ean.trim() !== '')
      )
    );
  }

  validateTax(idProduct: string): Observable<any> {
    return this.getProducts().pipe(
      map(products => {
        const product = products.find(product => product.id === idProduct);
        return product ? product.ingredient.taxesIngredients: null;
      })
    )
  }

  getProductsById(id: string): Observable<Products | undefined> {
    return this.http.get<Products>(`${this.baseUrl}/v1/stocktaking/${id}`);
  }

  addProduct(productsCreate: ProductsCreate, clientId: string | null): Observable<Products> {
    const product = { ...productsCreate, id: clientId };
    return this.http.post<Products>(`${this.baseUrl}/v1/stocktaking`, product);
  }

  updateProducts(products: any): Observable<any> {
    if (!products.id) {
      throw new Error('Product id is required');
    }
    const product = { ...products, slug: '' };
    return this.http.patch<any>(`${this.baseUrl}/v1/stocktaking/${products.id}`, product);
  }

  updateStock(idProduct: string, quantity: number, detil: string): Observable<any> {
    const body = { quantity, type: 'in', detil};
    return this.http.patch<any>(`${this.baseUrl}/v1/stocktaking/update-quantity/${idProduct}`, body);
  }

  deleteProductById(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/v1/stocktaking/${id}`);
  } 

  downloadFormat() {
    return this.http.get(`${this.baseUrl}/v1/upload-products/download`, {responseType: 'blob'});
  }

  uploadFormat(body: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', body, body.name);
    return this.http.post<any>(`${this.baseUrl}/v1/upload-products/upload`, formData);
  }
}
