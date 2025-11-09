import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // <-- add this
import { AuthService } from '../../services/auth.service'; // adjust path

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, HttpClientModule, RouterModule], // <-- include HttpClientModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    if (!this.credentials.username || !this.credentials.password) {
      alert('Please fill out all fields.');
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        alert(response.message || 'Login successful!');
        this.router.navigate(['/']); // redirect after login
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed!');
      }
    });
  }
}
