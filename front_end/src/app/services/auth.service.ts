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
  private userImageSubject = new BehaviorSubject<string>('assets/profile.jpg');
  public userImage$ = this.userImageSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/user/register`, userData, { headers });
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap((res: any) => {
        if (res.token) {
          this.saveToken(res.token);
          if (res.user?.image) {
            this.setUserImage(res.user.image);
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('image');
    this.loggedIn.next(false); // notify subscribers
    this.setUserImage('assets/default-profile.png'); // reset image
  }

  saveToken(token: string) {
    localStorage.setItem("token", token);
    this.loggedIn.next(true); // notify subscribers
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getProfile(): Observable<any> {
    const token = localStorage.getItem("token") || "";
    return this.http.get(`${this.apiUrl}/profile/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((res: any) => {
        if (res.user?.image) {
          this.setUserImage(res.user.image);
        }
      })
    );
  }

  updateProfile(data: FormData): Observable<any> {
    const token = localStorage.getItem("token") || "";
    return this.http.put(`${this.apiUrl}/profile/profile/edit`, data, {
        headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((res: any) => {
        // Update user image in header after profile edit
        if (res.user?.image) {
          this.setUserImage(res.user.image);
        }
      })
    );
  }

  setUserImage(image: string) {
    this.userImageSubject.next(image);
    localStorage.setItem('image', image); // persist locally
  }
}
