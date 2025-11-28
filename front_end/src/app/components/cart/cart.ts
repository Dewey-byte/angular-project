import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  imports: [NgFor, NgIf, FormsModule],
})
export class CartComponent {
  isOpen = false;
  cartItems: any[] = [];

  // Swipe-to-close
  startX = 0;
  currentX = 0;
  dragging = false;

  constructor(private cartService: CartService) {}

  openCart() {
    this.isOpen = true;
    this.loadCart();
    document.body.style.overflow = 'hidden'; // lock background scroll
  }

  closeCart() {
    this.isOpen = false;
    document.body.style.overflow = ''; // unlock scroll
  }

  loadCart() {
    this.cartService.getCartItems().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.cartItems = data;
        } else if (data && Array.isArray(data.items)) {
          this.cartItems = data.items;
        } else {
          this.cartItems = [];
        }
      },
      error: () => {
        this.cartItems = [];
      },
    });
  }

  removeItem(item: any) {
    if (!item.cart_id) return;
    this.cartService.removeCartItem(item.cart_id).subscribe({
      next: () => this.loadCart(),
    });
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1 || !item.cart_id) return;
    this.cartService.updateCartItem(item.cart_id, newQty).subscribe({
      next: () => this.loadCart(),
    });
  }

  getTotal() {
    return this.cartItems.reduce((sum, item) => {
      const price = parseFloat(item.Price || 0);
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }

  // Swipe-to-close methods
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

  onTouchEnd() {
    this.dragging = false;
    const translateX = this.currentX - this.startX;
    const modal = document.querySelector('.cart-modal') as HTMLElement;
    if (translateX < -100) {
      this.closeCart();
    } else {
      if (modal) modal.style.transform = `translateX(0)`;
    }
  }
}
