import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { Profile } from './components/profile/profile';
import { ProductsComponent } from './components/admin/products/products.component';
import { AdminPage } from './components/admin/admin';
import { AdminGuard } from './guards/admin-guard';
import { CheckoutComponent } from './components/checkout/checkout';



export const routes: Routes = [
  { path: '', component: LandingPage },   // default landing page
  { path: 'login', component: LoginComponent },    // login page
  { path: 'register', component: RegisterComponent }, // register page
  {path: 'profile', component: Profile}, // profile page
  {path: 'products', component: ProductsComponent}, // products page
  {path: 'checkout', component: CheckoutComponent}, // checkout page
  { path: 'admin/add-product', component: ProductsComponent },
  { path: 'admin', component: AdminPage, canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
