import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule, NgIf]
})
export class RegisterComponent {


  @Output() closeModalEvent = new EventEmitter<void>();

  isOpen = false;
  showPassword = false;


  userData = {
    full_name: '',
    email: '',
    username: '',
    password: '',
    contact_number: '',
    address: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  @Output() switchToLogin = new EventEmitter<void>();

openLogin() {
  this.switchToLogin.emit();
  this.closeModal();
}


  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.closeModalEvent.emit();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  register() {
    this.authService.register(this.userData).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Registration Success!',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        this.closeModal();
        this.router.navigate(['/']);
      },
      error: (err) => {
        Swal.fire({
          title: 'Error!',
          text: 'Registration Failed',
          icon: 'error',
        });
      }
    });
  }
}
