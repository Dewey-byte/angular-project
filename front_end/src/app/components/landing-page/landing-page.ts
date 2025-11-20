import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { CartComponent } from "../cart/cart";
import { Profile } from "../profile/profile";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  standalone: true,
  imports: [RouterModule, LoginComponent, RegisterComponent, CartComponent]
})
export class LandingPage {

  @ViewChild('loginModal') loginModal!: LoginComponent;

  openLogin() {
    this.loginModal.openModal();
  }

    @ViewChild('registerModal') registerModal!: RegisterComponent;

    openRegister() {
      this.registerModal.openModal();
  }
  @ViewChild('productsSection') productsSection!: ElementRef;

  scrollToProducts() {
    const element = document.getElementById('products');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
