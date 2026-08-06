import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}

  goToJoin(): void {
    this.router.navigate(['/join']);
  }

  goToAdminPanel(): void {
    const password = prompt('Enter admin password (mamus)');

    if (password === 'mamus') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      alert('Wrong password');
    }
  }
}