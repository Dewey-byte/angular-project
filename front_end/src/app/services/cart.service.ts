import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://127.0.0.1:5000/cart';

  constructor(private http: HttpClient) {}

  // attach token to all requests
  private authHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getCartItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`, this.authHeaders());
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add`,
      { product_id: productId, quantity },
      this.authHeaders()
    );
  }

  removeCartItem(itemId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/remove/${itemId}`,
      this.authHeaders()
    );
  }
}
