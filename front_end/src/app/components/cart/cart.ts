import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class CartComponent {
  isOpen = false;
  cartItems: any[] = [];

  constructor(private cartService: CartService) {}

  openCart() {
    this.isOpen = true;
    this.loadCart(); // Load from backend
  }

  closeCart() {
    this.isOpen = false;
  }

  loadCart() {
    this.cartService.getCartItems().subscribe({
      next: (data) => {
        this.cartItems = data;
      },
      error: (err) => console.error(err),
    });
  }

  removeItem(id: number) {
    this.cartService.removeCartItem(id).subscribe(() => {
      this.loadCart(); // Refresh
    });
  }

  getTotal() {
    return this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}
