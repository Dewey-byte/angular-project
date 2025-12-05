import { Component } from '@angular/core';
import { CheckoutService } from '../../services/checkout.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  standalone: true,
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
  imports: [FormsModule, NgIf, NgFor]
})
export class CheckoutComponent {
  step = 1;
  isModalOpen = false;

  shippingData = { full_name: '', address: '', contact_number: '' };
  paymentData = { method: 'COD' };
  reviewData: any = null;
  orderSummary: any = null;

  constructor(private checkoutService: CheckoutService) {}

  // Open checkout modal and auto-fill shipping info
  openModal() {
    this.isModalOpen = true;
    this.step = 1;
    this.loadShipping();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // Load shipping info from backend
  loadShipping() {
    this.checkoutService.reviewOrder().subscribe({
      next: (res: any) => {
        if (res && res.user_info) {
          this.shippingData = {
            full_name: res.user_info.full_name || '',
            address: res.user_info.address || '',
            contact_number: res.user_info.contact_number || ''
          };
        }
      },
      error: () => Swal.fire({
        title: 'Error!',
        text: 'Failed to load shipping info.',
        icon: 'error',
      })
    });
  }

  // Save shipping info and go to payment step
  saveShipping() {
    this.checkoutService.saveShipping(this.shippingData).subscribe({
      next: () => this.step = 2,
      error: () => Swal.fire({
        title: 'Error!',
        text: 'Failed to save shipping info.',
        icon: 'error',
      })
    });
  }

  // Payment step (skip backend for COD)
  savePayment() {
    this.loadReview(); // Load the review step
    this.step = 3;     // Move to review step
  }

  // Load review/order items from backend
  loadReview() {
    this.checkoutService.reviewOrder().subscribe({
      next: (res: any) => {
        if (res && res.items) {
          // map backend keys to nicer camelCase
          res.items = res.items.map((i: any) => ({
            name: i.Product_Name,
            price: i.Price,
            quantity: i.quantity
          }));
        }
        this.reviewData = res;
      },
      error: () => Swal.fire({
        title: 'Error!',
        text: 'Failed to load order review.',
        icon: 'error',
      })
    });
  }


  // Place order and display order summary
  confirmOrder() {
    this.checkoutService.placeOrder().subscribe({
      next: (res) => {
        console.log(res);  // Debug backend response
        this.orderSummary = res;
        this.step = 4;
      },
      error: () => Swal.fire({
        title: 'Error!',
        text: 'Something went wrong while placing the order.',
        icon: 'error',
      })
    });
  }

  // Step navigation
  nextStep() { if (this.step < 4) this.step++; }
  prevStep() { if (this.step > 1) this.step--; }
}
