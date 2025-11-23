import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  imports: [NgFor, NgIf],
})
export class CartComponent {
  isOpen = false;
  cartItems: any[] = [];

  // Swipe-to-close properties
  startX = 0;
  currentX = 0;
  dragging = false;

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
      this.loadCart(); // Refresh cart after removal
    });
  }

  getTotal() {
    return this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // =============================
  // SWIPE-TO-CLOSE METHODS
  // =============================
  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.dragging = true;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.dragging) return;
    this.currentX = event.touches[0].clientX;
    const translateX = Math.min(0, this.currentX - this.startX);
    const modal = document.querySelector('.cart-modal') as HTMLElement;
    if (modal) modal.style.transform = `translateX(${translateX}px)`;
  }

  onTouchEnd(event: TouchEvent) {
    this.dragging = false;
    const translateX = this.currentX - this.startX;
    const modal = document.querySelector('.cart-modal') as HTMLElement;

    if (translateX < -100) {
      // swipe left to close
      this.closeCart();
    } else {
      // reset position
      if (modal) modal.style.transform = `translateX(0)`;
    }
  }
}
