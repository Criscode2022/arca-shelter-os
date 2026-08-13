import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly user = signal<User | null>(this.readUser());

  isAuthed() { return !!localStorage.getItem('arca_token'); }

  private readUser(): User | null {
    const raw = localStorage.getItem('arca_user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private persist(res: AuthResponse) {
    localStorage.setItem('arca_token', res.accessToken);
    localStorage.setItem('arca_user', JSON.stringify(res.user));
    this.user.set(res.user);
  }

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(tap((res) => this.persist(res)));
  }

  register(payload: { email: string; password: string; name: string; shelterName?: string }) {
    return this.api.register(payload).pipe(tap((res) => this.persist(res)));
  }

  setUser(user: User) {
    localStorage.setItem('arca_user', JSON.stringify(user));
    this.user.set(user);
  }

  logout() {
    localStorage.removeItem('arca_token');
    localStorage.removeItem('arca_user');
    this.user.set(null);
    void this.router.navigateByUrl('/login');
  }
}
