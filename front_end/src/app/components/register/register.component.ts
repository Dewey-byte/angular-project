import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // adjust path accordingly

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,       // make it standalone
  imports: [FormsModule, RouterModule]
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

  constructor(private router: Router, private authService: AuthService) {}

  register() {
    this.authService.register(this.userData).subscribe({
      next: (response) => {
        alert(response.message || 'Registration successful!');
        this.router.navigate(['/login']); // optional: redirect to login after registration
      },
      error: (err) => {
        alert(err.error?.message || 'Registration failed!');
      }
    });
  }
}
