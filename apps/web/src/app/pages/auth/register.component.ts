import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center px-6 py-16">
      <form class="card w-full max-w-md p-8" (ngSubmit)="submit()">
        <h1 class="font-display text-3xl font-semibold">Open a shelter</h1>
        <p class="mt-2 text-sm text-ink-500">Your own empty board. No credit card, no ceremony.</p>
        <label class="label mt-6">Your name</label>
        <input class="input" name="name" [(ngModel)]="name" required />
        <label class="label mt-4">Shelter name</label>
        <input class="input" name="shelterName" [(ngModel)]="shelterName" />
        <label class="label mt-4">Email</label>
        <input class="input" type="email" name="email" [(ngModel)]="email" required />
        <label class="label mt-4">Password</label>
        <input class="input" type="password" name="password" [(ngModel)]="password" minlength="8" required />
        @if (error()) { <p class="mt-3 text-sm text-clay-600">{{ error() }}</p> }
        <button class="btn-primary mt-6 w-full" type="submit" [disabled]="busy()">Create workspace</button>
        <p class="mt-6 text-sm text-ink-500">Already have one? <a routerLink="/login" class="font-semibold text-moss-600">Sign in</a></p>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  name = '';
  shelterName = '';
  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  submit() {
    this.busy.set(true);
    this.error.set('');
    this.auth.register({ email: this.email, password: this.password, name: this.name, shelterName: this.shelterName }).subscribe({
      next: () => void this.router.navigateByUrl('/app'),
      error: (err) => { this.error.set(err.error?.message || 'Could not register'); this.busy.set(false); },
    });
  }
}
