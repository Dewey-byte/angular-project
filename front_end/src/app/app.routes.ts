import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { Profile } from './components/profile/profile';
import { ProductsComponent } from './components/products/products.component';
import { AdminPage } from './components/admin/admin';

export const routes: Routes = [
  { path: '', component: LandingPage },   // default landing page
  { path: 'login', component: LoginComponent },    // login page
  { path: 'register', component: RegisterComponent }, // register page
  {path: 'profile', component: Profile}, // profile page
  {path: 'products', component: ProductsComponent}, // products page
  {path: 'admin',component: AdminPage} // admin page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
