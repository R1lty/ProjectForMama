import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/admin/dashboard/dashboard';
import { JoinRoom } from './components/user/join-room/join-room';
import { GameView } from './components/admin/game-view/game-view';
import { Categories } from './components/admin/categories/categories';
import { Questions } from './components/admin/questions/questions';
import { Users } from './components/admin/users/users';
import { QuestionCreate } from './components/admin/questions/question-create/question-create';
import { QuestionEdit } from './components/admin/questions/question-edit/question-edit';
import { Games } from './components/admin/games/games';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    pathMatch: 'full'
  },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        component: Users
      },
      {
        path: 'categories',
        component: Categories
      },
      {
        path: 'questions',
        component: Questions
      },
      {
        path: 'questions/create',
        component: QuestionCreate
      },
      {
        path: 'questions/:id/edit',
        component: QuestionEdit
      },
      {
        path: 'games',
        component: Games
      }
    ]
  },
  {
    path: 'join',
    component: JoinRoom
  }
];