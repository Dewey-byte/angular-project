import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports:[FormsModule, RouterModule, HttpClientModule, NgIf],
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        console.log("User loaded:", this.user);
      },
      error: (err) => {
        console.log("Profile error:", err);
      }
    });
  }
}
