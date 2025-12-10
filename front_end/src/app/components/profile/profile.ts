import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  imports: [NgIf, FormsModule]
})
export class Profile {
  isOpen = false;
  user: any = null;
  editing = false;
  formData: any = {};
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  openProfile() {
    this.isOpen = true;
    this.loadUser();
  }

  loadUser() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        this.formData = { ...res.user };
      },
      error: (err) => console.error(err)
    });
  }

  editProfile() { this.editing = true; }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.formData.image = e.target.result;
      reader.readAsDataURL(this.selectedFile); // show preview
    }
  }

  onContactKeyPress(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }


  saveProfile() {
    const formData = new FormData();
    formData.append("Full_Name", this.formData.Full_Name);
    formData.append("Username", this.formData.Username);
    formData.append("Contact_Number", this.formData.Contact_Number);
    formData.append("Address", this.formData.Address);

    // send old image in case no new file
    formData.append("Current_Image", this.user.image || "");

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    this.authService.updateProfile(formData).subscribe({
      next: (res) => {
        this.loadUser();
        this.editing = false;
      },
      error: (err) => console.error(err)
    });
  }


  cancelEdit() {
    this.editing = false;
    this.formData = { ...this.user };
    this.selectedFile = null;
  }

  logout() {
    this.authService.logout();
    this.closeProfile();
    this.router.navigate(['/']);
  }

  closeProfile() { this.isOpen = false; this.editing = false; }
  stopPropagation(event: Event) { event.stopPropagation(); }
}
