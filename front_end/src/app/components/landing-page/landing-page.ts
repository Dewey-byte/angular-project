import { CheckoutComponent } from './../checkout/checkout';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Profile } from './../profile/profile';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { CartComponent } from "../cart/cart";
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OrderHistoryService } from '../../services/user.order.history.service';
import { OrdersModalComponent } from '../orders-history/orders-history';


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
    CheckoutComponent,

  ]
})
export class LandingPage implements OnInit, AfterViewInit {

  // -------------------------------
  // MODAL REFERENCES
  // -------------------------------
  @ViewChild('loginModal') loginModal!: LoginComponent;
  @ViewChild('registerModal') registerModal!: RegisterComponent;
  @ViewChild('cartModal') cartModal!: CartComponent;
  @ViewChild('profileModal') profileModal!: Profile;
  @ViewChild('checkoutComponent') checkoutComponent!: CheckoutComponent;
  @ViewChild('orderModal') orderModal!: OrdersModalComponent;

  // -------------------------------
  // USER STATE
  // -------------------------------
  isLoggedIn = false;
  userImage: string = 'assets/profile.jpg';
  userOrders: any[] = [];

  // -------------------------------
  // PRODUCTS
  // -------------------------------
  products: any[] = [];
  paginatedProducts: any[] = [];
  backendURL = "http://127.0.0.1:5000/products";

  // -------------------------------
  // FILTER VARIABLES
  // -------------------------------
  categories: string[] = [];
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

  // -------------------------------
  // ORDER MODAL
  // -------------------------------
  selectedOrder: any = null;

  constructor(
    public auth: AuthService,
    private orderService: OrderHistoryService
  ) {}

  ngOnInit() {
    // Subscribe to login state
    this.auth.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) this.loadUserOrders();
    });
    this.auth.userImage$.subscribe(img => this.userImage = img);

    // Load filters & products
    this.loadFilters();
    this.loadProducts();
  }

  ngAfterViewInit() {}

  // ==========================
  // LOAD FILTERS
  // ==========================
  loadFilters() {
    fetch(`${this.backendURL}/filters`)
      .then(res => res.ok ? res.json() : Promise.reject(`Server returned ${res.status}`))
      .then((data: any) => {
        this.categories = data?.categories || [];
        this.minPrice = null;
        this.maxPrice = null;
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
    this.minPrice = this.parseNumber(this.minPrice);
    this.maxPrice = this.parseNumber(this.maxPrice);

    if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
      [this.minPrice, this.maxPrice] = [this.maxPrice, this.minPrice];
    }

    this.selectedCategory = this.selectedCategory || 'all';
    this.loadProducts();
  }

  private parseNumber(value: any): number | null {
    if (value === '' || value === null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  // ==========================
  // LOAD PRODUCTS
  // ==========================
  loadProducts() {
    const params = new URLSearchParams();

    if (this.searchText?.trim()) params.set('search', this.searchText.trim());
    if (this.selectedCategory && this.selectedCategory !== 'all') params.set('category', this.selectedCategory);
    if (this.minPrice !== null) params.set('min_price', String(this.minPrice));
    if (this.maxPrice !== null) params.set('max_price', String(this.maxPrice));

    const url = `${this.backendURL}/filter?${params.toString()}`;

    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject(`Server returned ${res.status}`))
      .then((data: any[]) => {
        this.products = Array.isArray(data) ? data : [];
        this.currentPage = 1;
        this.paginate();
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        this.products = [];
        this.paginatedProducts = [];
        this.currentPage = 1;
        this.totalPages = 1;
      });
  }

  // ==========================
  // PAGINATION
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
      Swal.fire({ title: 'Error!', text: 'Failed to add item to cart.', icon: 'error' });
    }
  }

  // ==========================
  // ORDER MODAL METHODS
  // ==========================
  openOrderModal() {
    const token = this.auth.getToken();
    const userId = this.auth.getUserId();

    if (!token || !userId) {
      alert("Please log in to view your orders.");
      return;
    }

    this.orderService.getUserOrders(userId).subscribe({
      next: (res: any) => {
        const orders = res?.orders || []; // <-- always use res.orders
        console.log("ORDERS:", orders);
        this.orderModal?.openModal(orders); // pass orders to modal
      },
      error: (err) => {
        console.error("Error loading orders:", err);
        this.orderModal?.openModal([]); // pass empty array on error
      }
    });
  }




  closeOrderModal() {
    this.selectedOrder = null;
  }

  // ==========================
  // PRELOAD USER ORDERS
  // ==========================
  loadUserOrders() {
    const token = this.auth.getToken();
    const userId = this.auth.getUserId();

    if (!token || !userId) return;

    this.orderService.getUserOrders(userId).subscribe({
      next: (res: any) => {
        console.log("USER ORDERS:", res);
        this.userOrders = Array.isArray(res?.orders) ? res.orders : res;
      },
      error: (err) => {
        console.error("Error fetching orders:", err);
        this.userOrders = [];
      }
    });
  }

  // ==========================
  // MODAL HELPERS
  // ==========================
  openLogin() { this.loginModal?.openModal(); }
  openRegister() { this.registerModal?.openModal(); }
  openProfile() { this.profileModal?.openProfile(); }
  openCart() { this.cartModal?.openCart(); }

  // ==========================
  // SCROLL TO PRODUCTS
  // ==========================
  scrollToProducts() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
