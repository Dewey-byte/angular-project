import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

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
  Order_Status: string;
}

interface InventoryLog {
  log_id: number;
  product_name: string;
  action: string;
  quantity_changed: number;
  new_stock: number;
  timestamp: string;
  performed_by: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [NgIf, NgFor, RouterModule, DatePipe, FormsModule]
})
export class AdminPage implements OnInit {

  // Dashboard Stats
  totalProducts = 0;
  totalOrders = 0;
  lowStockItems = 0;

  // Data Arrays
  products: Product[] = [];
  orders: Order[] = [];
  inventoryLogs: InventoryLog[] = [];

  // UI Control
  activeTab: 'products' | 'orders' | 'inventory_logs' = 'products';
  isLoading = false;

  // Allowed ENUM statuses
  orderStatuses: string[] = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshDashboard();
  }

  // DASHBOARD LOADER
  refreshDashboard() {
    this.isLoading = true;
    Promise.all([
      this.loadProducts(),
      this.loadOrders(),
      this.loadInventoryLogs()
    ]).finally(() => this.isLoading = false);
  }

  // GET PRODUCTS
  loadProducts(): Promise<void> {
    return new Promise(resolve => {
      this.adminService.getProducts().subscribe({
        next: (res: Product[]) => {
          this.products = res.map(p => ({ ...p, Price: +p.Price }));
          this.totalProducts = res.length;
          this.lowStockItems = res.filter(p => p.Stock_Quantity < 5).length;
          resolve();
        },
        error: (err) => { console.error('Failed to load products:', err); resolve(); }
      });
    });
  }

  // GET ORDERS
  loadOrders(): Promise<void> {
    return new Promise((resolve) => {
      this.adminService.getOrders().subscribe({
        next: (res: any[]) => {
          // Map backend fields and convert Total_Amount to number
          this.orders = res.map(o => ({
            Order_ID: o.Order_ID ?? o.order_id, // adapt to backend
            Total_Amount: Number(o.Total_Amount ?? o.total_amount),
            Order_Date: o.Order_Date ?? o.order_date,
            Order_Status: o.Order_Status ?? o.order_status
          }));

          this.totalOrders = this.orders.length;
          resolve();
        },
        error: (err) => {
          console.error('Failed to load orders:', err);
          resolve();
        }
      });
    });
  }


  // CHANGE ORDER STATUS
  changeOrderStatus(orderId: number, newStatus: string) {
    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        const order = this.orders.find(o => o.Order_ID === orderId);
        if (order) order.Order_Status = newStatus;
        alert(`Order ${orderId} status updated to ${newStatus}`);
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        alert('Failed to update order status');
      }
    });
  }

  // GET INVENTORY LOGS
  loadInventoryLogs(): Promise<void> {
    return new Promise(resolve => {
      this.adminService.getInventoryLogs().subscribe({
        next: (res: any) => {
          this.inventoryLogs = res.logs || res;
          resolve();
        },
        error: (err) => { console.error('Failed to load inventory logs:', err); resolve(); }
      });
    });
  }

  // TAB SWITCHER
  switchTab(tab: 'products' | 'orders' | 'inventory_logs') {
    this.activeTab = tab;
  }

  // ADD PRODUCT
  addNewProduct() {
    this.router.navigate(['/admin/add-product']);
  }

  // DELETE PRODUCT
  deleteProduct(productId: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.adminService.deleteProduct(productId).subscribe({
      next: () => { alert('Product deleted successfully'); this.loadProducts(); },
      error: (err) => { console.error('Failed to delete product:', err); alert('Failed to delete product'); }
    });
  }

  // OPTIONAL — REVENUE DATA
  getRevenueChartData() {
    return this.orders.map(o => ({ date: o.Order_Date, amount: o.Total_Amount }));
  }
}
