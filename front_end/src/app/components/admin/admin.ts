import { NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

interface Product {
  Product_ID: number;
  Product_Name: string;
  Stock_Quantity: number;
  Price: number;
}

interface Order {
  Order_ID: number;
  Total_Amount: number;
  Order_Date: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [NgIf, NgFor, RouterModule]
})
export class AdminPage implements OnInit {

  // Dashboard Stats
  totalProducts = 0;
  totalOrders = 0;
  lowStockItems = 0;
  totalRevenue = 0;

  // Data Arrays
  products: Product[] = [];
  orders: Order[] = [];

  // UI Control
  activeTab: 'products' | 'orders' | 'reports' = 'products';
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshDashboard();
  }

  // ----------------------------
  // DASHBOARD LOADER
  // ----------------------------
  refreshDashboard() {
    this.isLoading = true;

    Promise.all([
      this.loadProducts(),
      this.loadOrders()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  // ----------------------------
  // GET PRODUCTS
  // ----------------------------
  loadProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.adminService.getProducts().subscribe({
        next: (res: Product[]) => {
          this.products = res;
          this.totalProducts = res.length;
          this.lowStockItems = res.filter(p => p.Stock_Quantity < 5).length;
          resolve();
        },
        error: (err) => {
          console.error('Failed to load products:', err);
          resolve();
        }
      });
    });
  }

  // ----------------------------
  // GET ORDERS
  // ----------------------------
  loadOrders(): Promise<void> {
    return new Promise((resolve) => {
      this.adminService.getOrders().subscribe({
        next: (res: Order[]) => {
          this.orders = res;
          this.totalOrders = res.length;

          // Compute Total Revenue
          this.totalRevenue = res.reduce((sum, o) => sum + (o.Total_Amount || 0), 0);

          resolve();
        },
        error: (err) => {
          console.error('Failed to load orders:', err);
          resolve();
        }
      });
    });
  }

  // ----------------------------
  // UI TAB SWITCHING
  // ----------------------------
  switchTab(tab: 'products' | 'orders' | 'reports') {
    this.activeTab = tab;
  }

  // ----------------------------
  // ADD PRODUCT
  // ----------------------------
  addNewProduct() {
    this.router.navigate(['/admin/add-product']);
  }

  // ----------------------------
  // DELETE PRODUCT
  // ----------------------------
  deleteProduct(productId: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.adminService.deleteProduct(productId).subscribe({
      next: () => {
        alert('Product deleted successfully');
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product');
      }
    });
  }

  // ----------------------------
  // REPORTS (Example)
  // ----------------------------
  getRevenueChartData() {
    return this.orders.map(o => ({
      date: o.Order_Date,
      amount: o.Total_Amount
    }));
  }
}
