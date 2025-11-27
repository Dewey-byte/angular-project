import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:5000';

  // Reactive login state
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.loggedIn.asObservable();

  // Reactive user image state
  private userImageSubject = new BehaviorSubject<string>(localStorage.getItem('image') || 'assets/profile.jpg');
  public userImage$ = this.userImageSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ----------------------
  // TOKEN HANDLING
  // ----------------------
  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  saveToken(token: string) {
    localStorage.setItem('access_token', token);
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('image');
    this.loggedIn.next(false);
    this.setUserImage('assets/profile.jpg'); // reset image
  }

  // ----------------------
  // AUTHENTICATION
  // ----------------------
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/user/register`, userData, { headers });
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap((res: any) => {
        if (res.token) {
          this.saveToken(res.token); // save JWT
          const image = res.user?.image || 'assets/profile.jpg';
          this.setUserImage(image); // reactive + localStorage
        }
      })
    );
  }

  // ----------------------
  // PROFILE MANAGEMENT
  // ----------------------
  getProfile(): Observable<any> {
    const token = this.getToken() || '';
    return this.http.get(`${this.apiUrl}/profile/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((res: any) => {
        const image = res.user?.image || 'assets/profile.jpg';
        this.setUserImage(image);
      })
    );
  }

  updateProfile(data: FormData): Observable<any> {
    const token = this.getToken() || '';
    return this.http.put(`${this.apiUrl}/profile/profile/edit`, data, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((res: any) => {
        const image = res.user?.image || 'assets/profile.jpg';
        this.setUserImage(image);
      })
    );
  }

  // ----------------------
  // USER IMAGE
  // ----------------------
  setUserImage(image: string) {
    this.userImageSubject.next(image);
    localStorage.setItem('image', image); // persist locally
  }
}
