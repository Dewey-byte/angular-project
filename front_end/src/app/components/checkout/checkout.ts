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

  openModal() {
    this.isModalOpen = true;
    this.step = 1;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveShipping() {
    this.checkoutService.saveShipping(this.shippingData).subscribe({
      next: () => this.step = 2,
      error: () => alert("Failed to save shipping info.")
    });
  }

  savePayment() {
    // Skip backend call; just proceed to review
    this.loadReview(); // Load the review step
    this.step = 3;     // Move to step 3
  }



  loadReview() {
    this.checkoutService.reviewOrder().subscribe({
      next: (res) => this.reviewData = res,
      error: () =>Swal.fire({
        title: 'Error!',
        text: 'Failed to Load.',
        icon: 'error',
    })
    });
  }

  confirmOrder() {
    this.checkoutService.placeOrder().subscribe({
      next: (res) => { this.orderSummary = res; this.step = 4; },
      error: () =>Swal.fire({
        title: 'Error!',
        text: 'Something went wrong.',
        icon: 'error',
    })
  });

  }

  nextStep() { if (this.step < 4) this.step++; }
  prevStep() { if (this.step > 1) this.step--; }
}
