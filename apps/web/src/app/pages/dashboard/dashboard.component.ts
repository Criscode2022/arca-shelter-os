import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Dashboard } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (data(); as d) {
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-clay-600">Today</p>
          <h1 class="font-display text-3xl font-semibold">{{ d.shelterName }}</h1>
        </div>
        <a routerLink="/app/animals" class="btn-primary">New intake</a>
      </div>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article class="card p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-ink-500">Kennel load</p>
          <p class="mt-2 font-display text-3xl">{{ d.occupancy.inHouse }}/{{ d.occupancy.capacity }}</p>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
            <div class="h-full bg-moss-500" [style.width.%]="d.occupancy.pct"></div>
          </div>
          <p class="mt-2 text-sm text-ink-500">{{ d.occupancy.remaining }} places left</p>
        </article>
        <article class="card p-5"><p class="text-xs font-semibold uppercase tracking-wide text-ink-500">Ready</p><p class="mt-2 font-display text-3xl">{{ d.totals.available }}</p><p class="mt-2 text-sm text-ink-500">available for adoption</p></article>
        <article class="card p-5"><p class="text-xs font-semibold uppercase tracking-wide text-ink-500">Medical hold</p><p class="mt-2 font-display text-3xl">{{ d.totals.medical }}</p><p class="mt-2 text-sm text-ink-500">{{ d.dueMedical.length }} due in 14 days</p></article>
        <article class="card p-5"><p class="text-xs font-semibold uppercase tracking-wide text-ink-500">Inbox</p><p class="mt-2 font-display text-3xl">{{ d.pendingAdoptions.length }}</p><p class="mt-2 text-sm text-ink-500">applications waiting</p></article>
      </div>
      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <section class="card p-5">
          <div class="mb-3 flex items-center justify-between"><h2 class="font-display text-xl">Due medical</h2><a routerLink="/app/medical" class="text-sm font-semibold text-moss-600">Open</a></div>
          @for (m of d.dueMedical; track m.id) {
            <div class="flex items-center justify-between border-t border-ink-100 py-3 text-sm">
              <div><div class="font-semibold">{{ m.animalName }}</div><div class="text-ink-500">{{ m.title }} · {{ m.kind }}</div></div>
              <span class="badge bg-clay-500/10 text-clay-700">{{ m.nextDue }}</span>
            </div>
          } @empty { <p class="text-sm text-ink-500">Nothing due. Rare and lovely.</p> }
        </section>
        <section class="card p-5">
          <div class="mb-3 flex items-center justify-between"><h2 class="font-display text-xl">Adoption inbox</h2><a routerLink="/app/adoptions" class="text-sm font-semibold text-moss-600">Open</a></div>
          @for (a of d.pendingAdoptions; track a.id) {
            <div class="flex items-center justify-between border-t border-ink-100 py-3 text-sm">
              <div><div class="font-semibold">{{ a.applicantName }}</div><div class="text-ink-500">for {{ a.animalName }}</div></div>
              <span class="badge bg-moss-500/10 text-moss-700">{{ a.status }}</span>
            </div>
          } @empty { <p class="text-sm text-ink-500">No open applications.</p> }
        </section>
        <section class="card p-5">
          <h2 class="font-display text-xl">Low stock</h2>
          @for (s of d.lowStock; track s.name) {
            <div class="flex items-center justify-between border-t border-ink-100 py-3 text-sm">
              <span>{{ s.name }}</span>
              <span class="font-semibold text-clay-700">{{ s.quantity }} {{ s.unit }}</span>
            </div>
          } @empty { <p class="mt-3 text-sm text-ink-500">Cupboards are fine.</p> }
        </section>
        <section class="card p-5">
          <h2 class="font-display text-xl">Upcoming shifts</h2>
          @for (s of d.upcomingShifts; track s.date + s.volunteerName) {
            <div class="flex items-center justify-between border-t border-ink-100 py-3 text-sm">
              <div><div class="font-semibold">{{ s.volunteerName }}</div><div class="text-ink-500">{{ s.role }}</div></div>
              <span>{{ s.date }} {{ s.startTime }}</span>
            </div>
          } @empty { <p class="mt-3 text-sm text-ink-500">No shifts on the board.</p> }
        </section>
      </div>
    }
  `,
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  readonly data = signal<Dashboard | null>(null);
  constructor() { this.api.dashboard().subscribe((d) => this.data.set(d)); }
}
