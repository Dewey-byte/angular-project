import { CheckoutComponent } from './../checkout/checkout';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Profile } from './../profile/profile';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { CartComponent } from "../cart/cart";
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  standalone: true,
  imports: [
    RouterModule,
    LoginComponent,
    RegisterComponent,
    CartComponent,
    Profile,
    NgIf,
    FormsModule,
    CommonModule,
    NgFor,
    CheckoutComponent
]
})
export class LandingPage implements AfterViewInit {

  // -------------------------------
  // MODAL REFERENCES
  // -------------------------------
  @ViewChild('loginModal') loginModal!: LoginComponent;
  @ViewChild('registerModal') registerModal!: RegisterComponent;
  @ViewChild('cartModal') cartModal!: CartComponent;
  @ViewChild('profileModal') profileModal!: Profile;
  @ViewChild('checkoutComponent')CheckoutComponent!: CheckoutComponent;

  // -------------------------------
  // USER STATE
  // -------------------------------
  isLoggedIn = false;
  userImage: string = 'assets/profile.jpg';

  // -------------------------------
  // SLIDER VARIABLES (optional)
  // -------------------------------
  currentSlide = 0;
  slides: NodeListOf<HTMLImageElement> = [] as any;

  // -------------------------------
  // PRODUCTS
  // -------------------------------
  products: any[] = [];
  paginatedProducts: any[] = [];
  backendURL = "http://127.0.0.1:5000/products";

  // -------------------------------
  // FILTER VARIABLES
  // -------------------------------
  categories: string[] = []; // Categories from backend
  searchText = "";
  selectedCategory = "all";
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // -------------------------------
  // PAGINATION VARIABLES
  // -------------------------------
  currentPage = 1;
  itemsPerPage = 16;
  totalPages = 1;

  constructor(public auth: AuthService) {}

  ngOnInit() {
    // Subscribe to login state
    this.auth.isLoggedIn$.subscribe(status => this.isLoggedIn = status);
    this.auth.userImage$.subscribe(img => this.userImage = img);

    // Load categories and min/max prices
    this.loadFilters();

    // Initial load of products
    this.loadProducts();
  }

  ngAfterViewInit() {
    // Optional: slider or other view initialization
  }

  // ==========================
  // LOAD FILTERS FROM BACKEND
  // ==========================
  loadFilters() {
    fetch(`${this.backendURL}/filters`)
      .then(res => res.ok ? res.json() : Promise.reject(`Server returned ${res.status}`))
      .then((data: any) => {
        this.categories = data.categories || [];
        // Set default min/max price to empty
        this.minPrice = null;
        this.maxPrice = null;
        console.log("Loaded filters:", data);
      })
      .catch(err => {
        console.error("Error loading filters:", err);
        this.categories = [];
        this.minPrice = null;
        this.maxPrice = null;
      });
  }


  // ==========================
  // APPLY FILTERS
  // ==========================
  applyFilters() {
    // Ensure min/max are numbers
    this.minPrice = this.parseNumber(this.minPrice);
    this.maxPrice = this.parseNumber(this.maxPrice);

    // Swap if min > max
    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
      [this.minPrice, this.maxPrice] = [this.maxPrice, this.minPrice];
    }

    // Ensure category is set
    this.selectedCategory = this.selectedCategory || 'all';

    // Debug
    console.log("Applying filters:", {
      search: this.searchText,
      category: this.selectedCategory,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });

    // Reload products
    this.loadProducts();
  }

  // -------------------------------
  // HELPER TO PARSE NUMBERS
  // -------------------------------
  private parseNumber(value: any): number | null {
    if (value === '' || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  // ==========================
  // LOAD PRODUCTS FROM BACKEND
  // ==========================
  loadProducts() {
    const params = new URLSearchParams();

    // Apply search filter
    if (this.searchText?.trim()) params.set('search', this.searchText.trim());
    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'all') params.set('category', this.selectedCategory);
    // Apply price filters
    if (this.minPrice !== null) params.set('min_price', String(this.minPrice));
    if (this.maxPrice !== null) params.set('max_price', String(this.maxPrice));

    const url = `${this.backendURL}/filter?${params.toString()}`;
    console.log("Fetching products from URL:", url);

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

  // ==========================
  // PAGINATION METHODS
  // ==========================
  paginate() {
    this.totalPages = Math.max(1, Math.ceil(this.products.length / this.itemsPerPage));
    this.currentPage = Math.min(Math.max(this.currentPage, 1), this.totalPages);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedProducts = this.products.slice(start, end);
  }

  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.paginate(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.paginate(); } }

  // ==========================
  // CART METHODS
  // ==========================
  async addToCart(product: any) {
    if (!this.isLoggedIn) { this.openLogin(); return; }
    if (!product?.Product_ID) { console.error('Invalid product', product); return; }

    const token = this.auth.getToken();
    if (!token) { alert("Please log in first."); return; }

    const payload = { product_id: product.Product_ID, quantity: 1 };

    try {
      const res = await fetch("http://127.0.0.1:5000/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add item to cart. Please try again.',
        icon: 'error',
      });

    }
  }

  // ==========================
  // MODAL HELPERS
  // ==========================
  openLogin() { this.loginModal?.openModal(); }
  openRegister() { this.registerModal?.openModal(); }
  openProfile() { this.profileModal?.openProfile(); }

  // ==========================
  // SCROLL TO PRODUCTS
  // ==========================
  scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
