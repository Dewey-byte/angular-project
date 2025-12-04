import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';


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

      // Clear credentials when closing modal
  this.credentials.email = '';
  this.credentials.password = '';
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
        Swal.fire({
          title: 'Login Success!',
          icon: 'success',
          confirmButtonText: 'OK'
        });


        // Save role to localStorage if backend returned it
        if (response.role) {
          localStorage.setItem('role', response.role);
        }

        // 🔥 Load user profile to update user image immediately
        this.authService.getProfile().subscribe();

        // Close modal
        this.closeModal();

        // Redirect based on role
        setTimeout(() => {
          if (response.role === 'Admin') {
            this.router.navigate(['/admin']);

          } else {
            this.router.navigate(['/']);
          }
        }, 100);
      },
      error: (err) => {
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong.',
          icon: 'error',
        });

      }
    });
  }
}