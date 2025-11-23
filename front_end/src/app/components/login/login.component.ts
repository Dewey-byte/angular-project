import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, NgIf, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @Output() close = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();

  isOpen = false;
  showPassword = false;

  credentials = {
    email: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  openRegister() {
    this.switchToRegister.emit();
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.close.emit();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please fill out all fields.');
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        alert(response.message || 'Login successful!');
        this.closeModal(); // CLOSE MODAL AFTER LOGIN
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed!');
      }
    });
  }
}
