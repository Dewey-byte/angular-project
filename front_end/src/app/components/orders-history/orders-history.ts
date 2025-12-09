import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderHistoryService } from '../../services/user.order.history.service';
import { CommonModule } from '@angular/common';

// -----------------------------
// Define Order interface here
// -----------------------------
interface Order {
  Order_Date: string;
  Order_ID: number;
  Order_Status: string;
  Total_Amount: string | number;
  User_ID: number;
}

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.html',
  styleUrls: ['./orders-history.css'],
  standalone: true,
  imports: [CommonModule]
})
export class OrdersModalComponent implements OnInit {
  selectedOrder: any[] = [];
  isOpen = false;

  constructor(private auth: AuthService, private orderService: OrderHistoryService) {}

  ngOnInit(): void {}


  openModal(ordersData?: Order[]) {
    if (ordersData) {
      this.selectedOrder = ordersData.map((order: Order) => ({
        ...order,
        Order_Date: this.convertToPHTime(order.Order_Date),
        Total_Amount: parseFloat(order.Total_Amount as string || '0')
      }));
      this.isOpen = true;
    } else {
      const token = this.auth.getToken();
      const userId = this.auth.getUserId();
      if (!token || !userId) return;

      this.orderService.getUserOrders(userId).subscribe({
        next: (res: any) => {
          const orders: Order[] = res?.orders || [];
          this.selectedOrder = orders.map((order: Order) => ({
            ...order,
            Order_Date: this.convertToPHTime(order.Order_Date),
            Total_Amount: parseFloat(order.Total_Amount as string || '0')
          }));
          this.isOpen = true;
        },
        error: () => {
          this.selectedOrder = [];
          this.isOpen = true;
        }
      });
    }
  }



  closeModal() {
    this.isOpen = false;
  }

  convertToPHTime(dateStr: string): string {
    const date = new Date(dateStr);
    const phTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    return phTime.toLocaleString('en-PH', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  formatCurrency(amount: string | number): string {
    const n = Number(amount);
    if (isNaN(n)) return '₱0.00';
    return n.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP'
    });
  }

}
