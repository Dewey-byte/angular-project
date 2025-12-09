import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private apiUrl = 'http://127.0.0.1:5000/orders';

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

  getUserOrders(userId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/user/${userId}`,
      this.authHeaders()
    );
  }

}