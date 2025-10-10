import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  credentials = {
    Username: '',
    Password: ''
  };

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        alert(res.message || 'Login successful!');
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed!');
      }
    });
  }
}
