import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  imports: [NgFor]
})
export class ProductsComponent implements OnInit {
  products: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.adminService.getProducts().subscribe(res => {
      this.products = res;
    });
  }

  deleteProduct(id: number) {
    this.adminService.deleteProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }
}
