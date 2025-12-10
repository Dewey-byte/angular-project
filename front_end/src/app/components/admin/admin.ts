import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Product {
  Product_ID: number;
  User_ID: number;
  Product_Name: string;
  Stock_Quantity: number;
  Price: number;
}

interface Order {
  User_ID: any;
  Order_ID: number;
  Total_Amount: number;
  Order_Date: string;
  Order_Status: string;
}

interface InventoryLog {
  Log_ID: number;
  Product_ID: number;
  Change_Type: string;
  Quantity_Changed: number;
  Remarks: string;
  Log_Date: string;
}

interface Users {
  User_ID: number;
  Full_Name: string;
  Email: string;
  Username: string;
  Role: string;
  Contact_Number: string;
  Address: string;
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
  users: Users[] = [];

  // UI Control
  activeTab: 'products' | 'orders' | 'inventory_logs' | 'users' = 'products';
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

  // ===================== DASHBOARD LOADER =====================
  refreshDashboard() {
    this.isLoading = true;
    Promise.all([
      this.loadProducts(),
      this.loadOrders(),
      this.loadInventoryLogs()
    ]).finally(() => this.isLoading = false);
  }

  // ===================== PRODUCTS =====================
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

  async deleteProduct(productId: number) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This product will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    this.adminService.deleteProduct(productId).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'Product deleted successfully.', 'success');
        this.loadProducts();
      },
      error: () => {
        Swal.fire('Error', 'Failed to delete product.', 'error');
      }
    });
  }

  addNewProduct() {
    this.router.navigate(['/admin/add-product']);
  }

  // ===================== ORDERS =====================
  loadOrders(): Promise<void> {
    return new Promise(resolve => {
      this.adminService.getOrders().subscribe({
        next: (res: any[]) => {
          this.orders = res.map(o => ({
            Order_ID: o.Order_ID ?? o.order_id,
            User_ID: o.User_ID ?? o.user_id,
            Total_Amount: Number(o.Total_Amount ?? o.total_amount),
            Order_Date: o.Order_Date ?? o.order_date,
            Order_Status: o.Order_Status ?? o.order_status
          }));
          this.totalOrders = this.orders.length;
          resolve();
        },
        error: (err) => { console.error('Failed to load orders:', err); resolve(); }
      });
    });
  }

  changeOrderStatus(orderId: number, newStatus: string) {
    this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        const order = this.orders.find(o => o.Order_ID === orderId);
        if (order) order.Order_Status = newStatus;

        Swal.fire(
          'Status Updated',
          `Order ${orderId} updated to ${newStatus}`,
          'success'
        );
      },
      error: () => {
        Swal.fire('Error', 'Failed to update order status.', 'error');
      }
    });
  }

  // ===================== INVENTORY LOGS =====================
  loadInventoryLogs(): Promise<void> {
    return new Promise(resolve => {
      this.adminService.getInventoryLogs().subscribe({
        next: (res: InventoryLog[]) => {
          this.inventoryLogs = res.map(log => ({
            ...log,
            Log_Date: log.Log_Date
          }));
          resolve();
        },
        error: (err) => { console.error('Failed to load inventory logs:', err); resolve(); }
      });
    });
  }

  async deleteInventoryLog(logId: number) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This log will be removed permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    this.adminService.deleteInventoryLog(logId).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'Inventory log deleted successfully.', 'success');
        this.loadInventoryLogs();
      },
      error: () => {
        Swal.fire('Error', 'Failed to delete inventory log.', 'error');
      }
    });
  }

  // ===================== USERS =====================
  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (res: any) => {
        if (res.status === 'success' && Array.isArray(res.users)) {
          this.users = res.users.map((u: any[]) => ({
            User_ID: u[0],
            Full_Name: u[1],
            Email: u[2],
            Username: u[3],
            Role: u[4],
            Contact_Number: u[5],
            Address: u[6],
            Image: u[7]
          }));
        } else {
          this.users = [];
        }
        console.log('Mapped users:', this.users);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.users = [];
      }
    });
  }

  async deleteUser(userId: number): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be deleted permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete user!',
    });

    if (!result.isConfirmed) return;

    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        Swal.fire('Deleted!', 'User deleted successfully.', 'success');
        this.loadUsers();
      },
      error: () => {
        Swal.fire('Error', 'Failed to delete user.', 'error');
      }
    });
  }

  // ===================== TAB SWITCHER =====================
  switchTab(tab: 'products' | 'orders' | 'inventory_logs' | 'users') {
    this.activeTab = tab;
    if (tab === 'users') this.loadUsers();
  }

  // ===================== DASHBOARD CHART =====================
  getRevenueChartData() {
    return this.orders.map(o => ({ date: o.Order_Date, amount: o.Total_Amount }));
  }
}
