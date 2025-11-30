import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Profile } from './../profile/profile';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { CartComponent } from "../cart/cart";
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  standalone: true,
  imports: [
    RouterModule, LoginComponent, RegisterComponent,
    CartComponent, Profile, NgIf, FormsModule, CommonModule, NgFor
  ]
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

  products: any[] = [];
  paginatedProducts: any[] = [];

  backendURL = "http://127.0.0.1:5000/products";

  searchText = "";
  selectedCategory = "all";
  minPrice: number | null = null;
  maxPrice: number | null = null;

  currentPage = 1;
  itemsPerPage = 16;
  totalPages = 1;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    // Subscribe to reactive login state
    this.auth.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.auth.userImage$.subscribe(img => this.userImage = img);

    // Initial load
    this.loadProducts();
  }

  ngAfterViewInit() {
    this.slides = document.querySelectorAll('.hero-slideshow .slide');
    setInterval(() => this.nextSlide(), 8000);
  }

  nextSlide() {
    if (!this.slides.length) return;
    this.slides[this.currentSlide].classList.remove('active');
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.slides[this.currentSlide].classList.add('active');
  }


  // -------------------------------
  // FILTERS
  // -------------------------------
  loadProducts() {
    const params = new URLSearchParams();

    if (this.searchText?.trim()) params.set('search', this.searchText.trim());
    if (this.selectedCategory && this.selectedCategory !== 'all') params.set('category', this.selectedCategory);
    if (this.minPrice !== null) params.set('min_price', String(this.minPrice));
    if (this.maxPrice !== null) params.set('max_price', String(this.maxPrice));

    const url = `${this.backendURL}?${params.toString()}`;

    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject(`Server returned ${res.status}`))
      .then((data: any[]) => {
        this.products = Array.isArray(data) ? data : [];
        this.currentPage = 1;
        this.totalPages = Math.max(1, Math.ceil(this.products.length / this.itemsPerPage));
        this.paginate();
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        this.products = [];
        this.paginatedProducts = [];
        this.totalPages = 1;
        this.currentPage = 1;
      });
  }

  applyFilters() {
    // Ensure numeric min/max
    this.selectedCategory = this.selectedCategory || 'all';
    this.minPrice = this.parseNumber(this.minPrice);
    this.maxPrice = this.parseNumber(this.maxPrice);

    // Swap if min > max
    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
      [this.minPrice, this.maxPrice] = [this.maxPrice, this.minPrice];
    }

    this.loadProducts();
  }

  private parseNumber(value: any): number | null {
    if (value === '' || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  // -------------------------------
  // PAGINATION
  // -------------------------------
  paginate() {
    this.totalPages = Math.max(1, Math.ceil(this.products.length / this.itemsPerPage));
    this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.products.slice(start, end);
  }

  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.paginate(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.paginate(); } }

  // -------------------------------
  // ADD TO CART
  // -------------------------------
  async addToCart(product: any) {
    if (!this.isLoggedIn) {
      this.openLogin();
      return;
    }

    if (!product?.Product_ID) {
      console.error('Invalid product', product);
      return;
    }

    const token = this.auth.getToken();
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const payload = { product_id: product.Product_ID, quantity: 1 };

    try {
      const res = await fetch("http://127.0.0.1:5000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cart API returned ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("Added to cart:", data);
      this.cartModal?.openCart();
    } catch (err: any) {
      console.error("Add to cart error:", err);
      alert("Failed to add product to cart.");
    }
  }

  // -------------------------------
  // MODAL HELPERS + SCROLL
  // -------------------------------
  openLogin() { this.loginModal?.openModal(); }
  openRegister() { this.registerModal?.openModal(); }
  openProfile() { this.profileModal?.openProfile(); }

  scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
