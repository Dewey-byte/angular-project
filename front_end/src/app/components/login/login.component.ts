import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  credentials = { Username: '', Password: '' };

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        alert(res.message || 'Login successful!');
        console.log('Token:', res.token);
      },
      error: (err) => {
        alert(err.error?.error || 'Login failed!');
        console.error(err);
      }
    });
  }
}
