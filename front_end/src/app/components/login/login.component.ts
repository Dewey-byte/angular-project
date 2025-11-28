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
        alert(response.message || 'Login successful!');

        // Save role to localStorage if backend returned it
        if (response.role) {
          localStorage.setItem('role', response.role);
        }

        // ✅ Close modal first, then redirect
        this.closeModal();

        // Use response.role directly to redirect
        setTimeout(() => {
          if (response.role === 'Admin') {
            this.router.navigate(['/admin']);  // must match your AppRoutingModule
          } else {
            this.router.navigate(['/']);       // normal user goes to landing page
          }
        }, 100); // slight delay ensures modal closes before navigation
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed!');
      }
    });
  }
}
