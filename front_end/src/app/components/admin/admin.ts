import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [RouterModule]
})
export class AdminPage {

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
}