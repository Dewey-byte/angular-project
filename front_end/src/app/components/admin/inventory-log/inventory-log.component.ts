import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-inventory-log',
  templateUrl: './inventory-log.component.html',
  imports: [NgFor]
})
export class InventoryLogComponent implements OnInit {
  logs: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.adminService.getInventoryLogs().subscribe(res => {
      this.logs = res;
    });
  }
}
