import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Profile } from './../profile/profile';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { CartComponent } from "../cart/cart";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  standalone: true,
  imports: [RouterModule, LoginComponent, RegisterComponent, CartComponent, Profile, NgIf]
})
export class LandingPage implements AfterViewInit {
  @ViewChild('loginModal') loginModal!: LoginComponent;
  @ViewChild('registerModal') registerModal!: RegisterComponent;
  @ViewChild('cartModal') cartModal!: CartComponent;
  @ViewChild('profileModal') profileModal!: Profile;

  isLoggedIn = false;
  userImage: string = 'assets/profile.jpg';

  currentSlide = 0;
  slides: NodeListOf<HTMLImageElement> = [] as any;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.auth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.userImage = status ? localStorage.getItem('image') || 'assets/profile.jpg' : 'assets/profile.jpg';
    });

    if (this.auth.isLoggedIn()) {
      this.isLoggedIn = true;
      this.userImage = localStorage.getItem('image') || 'assets/profile.jpg';
    }

    this.auth.userImage$.subscribe((img) => {
      if (img) this.userImage = img;
    });
  }

  ngAfterViewInit() {
    this.slides = document.querySelectorAll('.hero-slideshow .slide');
    setInterval(() => this.nextSlide(), 8000); // Change slide every 5s
  }

  nextSlide() {
    if (!this.slides.length) return;

    this.slides[this.currentSlide].classList.remove('active');
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.slides[this.currentSlide].classList.add('active');
  }

  openLogin() { this.loginModal.openModal(); }
  openRegister() { this.registerModal.openModal(); }
  openProfile() { this.profileModal.openProfile(); }

  scrollToProducts() {
    const element = document.getElementById('products');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
