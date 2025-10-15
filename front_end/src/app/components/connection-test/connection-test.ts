import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-connection-test',
  templateUrl: './connection-test.html',
  styleUrls: ['./connection-test.css']
})
export class ConnectionTest {
  message = '';
  isConnected = false;

  constructor(private api: ApiService) {}

  checkConnection() {
    this.api.testConnection().subscribe({
      next: (res) => {
        this.message = '✅ Connected to Flask backend!';
        this.isConnected = true;
        console.log('Response:', res);
      },
      error: (err) => {
        this.message = '❌ Failed to connect to Flask backend!';
        this.isConnected = false;
        console.error('Error:', err);
      }
    });
  }
}
