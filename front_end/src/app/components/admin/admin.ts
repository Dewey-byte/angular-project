import { NgIf, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  RouterModule } from '@angular/router';

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports:[NgIf, NgFor, RouterModule]
})
export class AdminPage implements OnInit {

  totalProducts = 0;
  totalOrders = 0;
  lowStockItems = 0;
  totalRevenue = 0;

  products: Product[] = [];

  activeTab: 'products' | 'orders' | 'reports' = 'products';

  constructor() {}

  ngOnInit(): void {
    // TODO: Load actual data from backend
    this.loadData();
  }

  loadData() {
    // placeholder example
    this.products = [];
    this.totalProducts = this.products.length;
    this.lowStockItems = this.products.filter(p => p.stock < 5).length;
    this.totalRevenue = 0; // calculate from orders
    this.totalOrders = 0; // fetch from backend
  }

  switchTab(tab: 'products' | 'orders' | 'reports') {
    this.activeTab = tab;
  }

  addNewProduct() {
    alert('Open add new product modal or navigate to add page');
  }

}
