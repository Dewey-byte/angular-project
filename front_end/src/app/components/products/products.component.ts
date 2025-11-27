import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../services/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  imports:[CommonModule]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  selectedProduct: Product | null = null;


  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      // Convert Price to number to avoid currency pipe errors
      this.products = data.map(p => ({
        ...p,
        Price: +p.Price,          // Ensure Price is a number
        Stock_Quantity: +p.Stock_Quantity // optional, ensure stock is number too
      }));
    });
  }

  selectProduct(product: Product) {
    this.selectedProduct = product;
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
  }
}
