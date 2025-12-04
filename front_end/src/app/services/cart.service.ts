import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://127.0.0.1:5000/cart';

  constructor(private http: HttpClient) {}

  // Attach JWT token to headers
  private authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  // GET all cart items
  getCartItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/`, this.authHeaders());
  }

  // ADD to cart
  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/add`,
      { product_id: productId, quantity },
      this.authHeaders()
    );
  }


  // REMOVE from cart
  removeCartItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${itemId}`, this.authHeaders());
  }

  // UPDATE quantity
  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update/${itemId}`,
      { quantity },
      this.authHeaders()
    );
  }
  // CHECKOUT cart
  checkoutCart(): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, {}, this.authHeaders());
  }
}

