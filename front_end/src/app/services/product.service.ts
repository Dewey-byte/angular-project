import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  private apiUrl = 'http://localhost:5000/products';  // Flask URL

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  deleteProduct(id: number): Observable<void> { //admin only

    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);

  }
  getFilters(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/filters`);
  }

}
