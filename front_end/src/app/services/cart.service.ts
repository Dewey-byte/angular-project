import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://127.0.0.1:5000/api/cart';

  constructor(private http: HttpClient) {}

  getCartItems(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, {
      product_id: productId,
      quantity: quantity,
    });
  }

  removeCartItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${itemId}`);
  }
}
