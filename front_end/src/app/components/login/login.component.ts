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
  isOpen = false;

  credentials = {
    username: '',
    password: ''
  };

  constructor(private router: Router, private authService: AuthService) {}


  @Output() switchToRegister = new EventEmitter<void>();

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
        this.closeModal(); // CLOSE MODAL AFTER LOGIN
        // remove this.router.navigate(['/']);  // remove page reroute
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed!');
      }
    });
  }
}
