import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface AdminMenuItem {
  title: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  menuItems: AdminMenuItem[] = [
    {
      title: 'Пользователи',
      route: '/admin/dashboard/users',
      icon: '👥'
    },
    {
      title: 'Категории',
      route: '/admin/dashboard/categories',
      icon: '☰'
    },
    {
      title: 'Вопросы',
      route: '/admin/dashboard/questions',
      icon: '?'
    },
    {
      title: 'Игры',
      route: '/admin/dashboard/games',
      icon: ''
    }
  ];
}