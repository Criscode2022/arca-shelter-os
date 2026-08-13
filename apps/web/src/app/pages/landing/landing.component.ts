import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-paper">
      <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-moss-600 font-display text-white">A</div>
          <span class="font-display text-xl font-semibold">Arca</span>
        </div>
        <div class="flex gap-3">
          <a routerLink="/login" class="btn-ghost">Sign in</a>
          <a routerLink="/register" class="btn-primary">Open a shelter</a>
        </div>
      </header>
      <main class="mx-auto max-w-6xl px-6 pb-20 pt-10 lg:pt-16">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Rescue operations</p>
        <h1 class="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] text-ink-900 sm:text-6xl">Every animal, accounted for.</h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">Arca is the operating desk for independent shelters and rescue groups. Intakes, medical holds, foster homes, adoption applications and stock — without the spreadsheet fog.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/login" class="btn-primary">Try the Madrid demo</a>
          <a routerLink="/register" class="btn-secondary">Create an empty shelter</a>
        </div>
        <div class="mt-16 grid gap-4 sm:grid-cols-3">
          @for (f of features; track f.title) {
            <article class="card p-5">
              <h2 class="font-display text-xl font-semibold">{{ f.title }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ f.body }}</p>
            </article>
          }
        </div>
      </main>
    </div>
  `,
})
export class LandingComponent {
  readonly features = [
    { title: 'Kennel board', body: 'See who is in isolation, who is ready, and who is already in a foster sofa.' },
    { title: 'Medical due list', body: 'Vaccines and protocols surface before they lapse — not after a weekend surprise.' },
    { title: 'Adoption inbox', body: 'Applications move from new to home-check to approved without losing the thread.' },
  ];
}
