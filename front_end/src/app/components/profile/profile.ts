import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  user: any;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.auth.getProfile(token).subscribe({
        next: res => this.user = res.user,
        error: err => console.error(err)
      });
    }
  }
}
