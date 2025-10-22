import { Component } from '@angular/core';
import { ConnectionTest } from './components/connection-test/connection-test';
import { LandingPage } from './components/landing-page/landing-page';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LandingPage, ConnectionTest],
  template: `<app-landing-page></app-landing-page>, <app-connection-test></app-connection-test> `
})
export class AppComponent {}
