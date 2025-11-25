export interface Product {
  Product_ID?: number; // optional for new products
  Product_Name: string;
  Category: 'Book' | 'Stationery' | 'Notebook' | 'Pen' | 'Other';
  Description: string;
  Author_Brand: string;
  Price: number;
  Stock_Quantity: number;
}
