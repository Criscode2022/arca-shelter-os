import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register.component').then((m) => m.RegisterComponent) },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'animals', loadComponent: () => import('./pages/animals/animals.component').then((m) => m.AnimalsComponent) },
      { path: 'medical', loadComponent: () => import('./pages/medical/medical.component').then((m) => m.MedicalComponent) },
      { path: 'fosters', loadComponent: () => import('./pages/fosters/fosters.component').then((m) => m.FostersComponent) },
      { path: 'adoptions', loadComponent: () => import('./pages/adoptions/adoptions.component').then((m) => m.AdoptionsComponent) },
      { path: 'people', loadComponent: () => import('./pages/people/people.component').then((m) => m.PeopleComponent) },
      { path: 'inventory', loadComponent: () => import('./pages/inventory/inventory.component').then((m) => m.InventoryComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
