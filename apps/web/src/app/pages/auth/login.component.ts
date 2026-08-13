import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <aside class="hidden flex-col justify-between bg-ink-950 p-10 text-ink-100 lg:flex">
        <div class="font-display text-2xl text-white">Arca</div>
        <div>
          <p class="font-display text-4xl font-semibold leading-tight text-white">Keep the kennel honest.</p>
          <p class="mt-4 max-w-sm text-ink-300">Demo shelter: Arca Madrid. Seeded with eight animals, a medical board and a live adoption inbox.</p>
        </div>
        <p class="text-sm text-ink-400">nina.vega@arca.rescue · demo1234</p>
      </aside>
      <main class="flex items-center justify-center px-6 py-16">
        <form class="w-full max-w-sm" (ngSubmit)="submit()">
          <h1 class="font-display text-3xl font-semibold">Sign in</h1>
          <p class="mt-2 text-sm text-ink-500">Use the demo or your own shelter.</p>
          <label class="label mt-8">Email</label>
          <input class="input" type="email" name="email" [(ngModel)]="email" required />
          <label class="label mt-4">Password</label>
          <input class="input" type="password" name="password" [(ngModel)]="password" required />
          @if (error()) { <p class="mt-3 text-sm text-clay-600">{{ error() }}</p> }
          <button class="btn-primary mt-6 w-full" type="submit" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Enter the board' }}</button>
          <p class="mt-6 text-sm text-ink-500">No account? <a routerLink="/register" class="font-semibold text-moss-600">Register</a></p>
        </form>
      </main>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = 'nina.vega@arca.rescue';
  password = 'demo1234';
  readonly busy = signal(false);
  readonly error = signal('');

  submit() {
    this.busy.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => void this.router.navigateByUrl('/app'),
      error: () => { this.error.set('Invalid email or password'); this.busy.set(false); },
    });
  }
}
