import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  imports: [NgFor, NgIf, NgStyle, FormsModule, RouterModule]
})
export class ProductsComponent implements OnInit {
  products: any[] = [];

  // For Add / Update Product Form
  newProduct = {
    Product_Name: '',
    Stock_Quantity: 0,
    Price: 0,
    Category: '',
    image_uri: '',
    Description: ''
  };

  selectedProductId: number | null = null; // tracks edit mode
  showAddForm = false; // toggle form visibility
  imageOption: 'url' | 'file' = 'url'; // URL or file input
  selectedFile: File | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadProducts();
  }

  // ----------------------------
  // Load Products
  // ----------------------------
  loadProducts() {
    this.adminService.getProducts().subscribe(res => {
      this.products = res.map((p: any) => ({
        ...p,
        Price: Number(p.Price),
        Stock_Quantity: Number(p.Stock_Quantity),
        Image_URL: p.image_uri // map it to what your HTML expects
      }));
    });
  }

  // ----------------------------
  // Delete Product
  // ----------------------------
  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.adminService.deleteProduct(id).subscribe(() => {
      alert('Product deleted successfully');
      this.loadProducts();
    });
  }

  // ----------------------------
  // Toggle Add / Update Product Form
  // ----------------------------
  toggleAddForm(product?: any) {
    if (product) {
      // Edit mode
      this.selectedProductId = product.Product_ID;
      this.newProduct = { ...product };
      this.imageOption = 'url';
      this.selectedFile = null;
    } else {
      // Add mode
      this.resetForm();
    }
    this.showAddForm = !this.showAddForm;
  }

  // ----------------------------
  // Handle File Selection
  // ----------------------------
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.newProduct.image_uri = reader.result as string; // <-- updated here
      };
      reader.readAsDataURL(file);
    }
  }


  // ----------------------------
  // Add or Update Product
  // ----------------------------
  saveProduct() {
    const { Product_Name, Stock_Quantity, Price, Category, image_uri, Description } = this.newProduct;

    if (!Product_Name || Stock_Quantity < 0 || Price < 0 || !Category || !image_uri || !Description) {
      alert('Please fill all fields correctly');
      return;
    }

    if (this.selectedProductId) {
      this.adminService.updateProduct(this.selectedProductId, this.newProduct).subscribe({
        next: () => {
          alert('Product updated successfully');
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Failed to update product:', err);
          alert('Failed to update product');
        }
      });
    } else {
      this.adminService.addProduct(this.newProduct).subscribe({
        next: () => {
          alert('Product added successfully');
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Failed to add product:', err);
          alert('Failed to add product');
        }
      });
    }
  }

  // ----------------------------
  // Reset Form
  // ----------------------------
  resetForm() {
    this.newProduct = {
      Product_Name: '',
      Stock_Quantity: 0,
      Price: 0,
      Category: '',
      image_uri: '',
      Description: ''
    };
    this.selectedProductId = null;
    this.showAddForm = false;
    this.imageOption = 'url';
    this.selectedFile = null;
  }
}
