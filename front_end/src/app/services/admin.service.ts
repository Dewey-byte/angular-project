import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseURL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // PRODUCTS
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseURL}/products/`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.baseURL}/products/${id}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.baseURL}/products/`, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseURL}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/products/${id}`);
  }
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseURL}/orders`);
  }

  // INVENTORY LOGS
  getInventoryLogs(): Observable<any> {
    return this.http.get(`${this.baseURL}/inventory-log/`);
  }

  getInventoryLog(id: number): Observable<any> {
    return this.http.get(`${this.baseURL}/inventory-log/${id}`);
  }
}
