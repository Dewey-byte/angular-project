import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private api = 'http://localhost:5000/checkout';

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


  saveShipping(data: any) {
    return this.http.post(`${this.api}/shipping`, data, this.authHeaders());
  }


  reviewOrder() {
    return this.http.get(`${this.api}/review`, this.authHeaders());
  }

  placeOrder() {
    return this.http.post(`${this.api}/place_order`, {}, this.authHeaders());
  }
}
