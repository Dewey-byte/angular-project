import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  imports: [FormsModule, RouterModule, HttpClientModule, NgIf],
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  user: any = null;
  isProfileOpen: boolean = false;  // <-- Controls modal open/close

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
  }

  // Load user profile from AuthService
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

  // Open profile modal
  openProfile() {
    this.isProfileOpen = true;
  }

  // Close profile modal
  closeProfile() {
    this.isProfileOpen = false;
  }

  // Edit profile action
  editProfile() {
    // Navigate to profile edit page (or open edit form)
    this.router.navigate(['/profile/edit']);
  }

  // Logout action
  //logout() {
    //this.authService.logout();
    //this.router.navigate(['/login']);
  //}

  // Optional: handle modal click so it doesn't close when clicking inside
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
