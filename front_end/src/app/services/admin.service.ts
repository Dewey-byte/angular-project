import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseURL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // ================= PRODUCTS =================
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseURL}/products/`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.baseURL}/products/${id}`);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post(`${this.baseURL}/products/`, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.baseURL}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/products/${id}`);
  }

  // ================= ORDERS =================
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseURL}/orders/`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseURL}/orders/${orderId}`, { Order_Status: status });
  }

  // ================= INVENTORY LOGS =================
  getInventoryLogs(): Observable<any> {
    return this.http.get(`${this.baseURL}/inventory_log`);
  }

  getInventoryLog(id: number): Observable<any> {
    return this.http.get(`${this.baseURL}/inventory_log/${id}`);
  }

  createInventoryLog(log: any): Observable<any> {
    return this.http.post(`${this.baseURL}/inventory_log/`, log);
  }

  updateInventoryLog(id: number, log: any): Observable<any> {
    return this.http.put(`${this.baseURL}/inventory_log/${id}`, log);
  }

  deleteInventoryLog(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/inventory_log/${id}`);
  }

  // ================= USERS =================
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseURL}/users`);
  }

  getUser(id: number): Observable<any> {
    return this.http.get(`${this.baseURL}/users/${id}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseURL}/users/${id}`);
  }
}
