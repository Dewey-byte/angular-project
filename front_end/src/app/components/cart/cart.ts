import { NgFor, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CheckoutComponent } from '../checkout/checkout';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
  imports: [NgFor, NgIf, FormsModule, CheckoutComponent],
})
export class CartComponent {
  isOpen = false;
  cartItems: any[] = [];

  @ViewChild('checkoutComp') checkoutComponent!: CheckoutComponent;


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

    // Call when user changes quantity
    updateQuantity(itemId: number, newQty: number) {
      const quantity = Number(newQty);


      this.cartService.updateCartItem(itemId, newQty).subscribe({
        next: (res) => {
          // Success, reload cart
          this.loadCart();
        },
        error: (err) => {
          // Show alert if stock exceeded
          if (err.error && err.error.error) {
            Swal.fire({
              title: 'Warning',
              text: err.error.error,
              icon: 'warning',
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'Something went wrong updating cart.',
              icon: 'error',
            });
          }
        }
      });
    }
  getTotal() {
    return this.cartItems.reduce((sum, item) => {
      const price = parseFloat(item.Price || 0);
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }
    // ✅ Updated Checkout function to open modal
    checkout() {
      if (this.cartItems.length === 0) {
        Swal.fire('Cart is empty!');
        return;
      }

      if (this.checkoutComponent) {
        this.closeCart();           // Close cart drawer
        this.checkoutComponent.openModal();  // Open checkout modal
      }
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
