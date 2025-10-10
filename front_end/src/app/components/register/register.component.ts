import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, CommonModule]
})
export class RegisterComponent {
  userData = {
    Full_Name: '',
    Email: '',
    Username: '',
    Password: '',
    Contact_Number: '',
    Address: ''
  };

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.userData).subscribe({
      next: (response) => {
        alert(response.message || 'Registration successful!');
      },
      error: (err) => {
        alert(err.error?.message || 'Registration failed!');
      }
    });
  }
}
