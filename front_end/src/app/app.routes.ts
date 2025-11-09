import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './components/landing-page/landing-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component'; // if you have one

export const routes: Routes = [
  { path: '', component: LandingPage },   // default landing page
  { path: 'login', component: LoginComponent },    // login page
  { path: 'register', component: RegisterComponent } // register page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
