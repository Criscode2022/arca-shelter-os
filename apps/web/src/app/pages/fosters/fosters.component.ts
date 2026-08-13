import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Foster } from '../../core/models';

@Component({
  selector: 'app-fosters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="font-display text-3xl font-semibold">Foster homes</h1>
    <form class="card mt-5 grid gap-3 p-5 sm:grid-cols-3" (ngSubmit)="create()">
      <div><label class="label">Name</label><input class="input" name="name" [(ngModel)]="form.name" required /></div>
      <div><label class="label">City</label><input class="input" name="city" [(ngModel)]="form.city" /></div>
      <div><label class="label">Capacity</label><input class="input" type="number" name="capacity" [(ngModel)]="form.capacity" /></div>
      <div><label class="label">Email</label><input class="input" name="email" [(ngModel)]="form.email" /></div>
      <div><label class="label">Phone</label><input class="input" name="phone" [(ngModel)]="form.phone" /></div>
      <div><label class="label">Notes</label><input class="input" name="notes" [(ngModel)]="form.notes" /></div>
      <div class="sm:col-span-3"><button class="btn-primary" type="submit">Add home</button></div>
    </form>
    <div class="mt-5 grid gap-3 md:grid-cols-2">
      @for (f of rows(); track f.id) {
        <article class="card p-5">
          <div class="flex items-start justify-between">
            <div><h2 class="font-display text-xl">{{ f.name }}</h2><p class="text-sm text-ink-500">{{ f.city || 'City unknown' }} · {{ f.phone }}</p></div>
            <span class="badge bg-moss-500/10 text-moss-700">{{ f.placed }}/{{ f.capacity }}</span>
          </div>
          <p class="mt-3 text-sm text-ink-600">{{ f.notes || 'No notes' }}</p>
        </article>
      }
    </div>
  `,
})
export class FostersComponent {
  private readonly api = inject(ApiService);
  readonly rows = signal<Foster[]>([]);
  form = { name: '', city: '', capacity: 1, email: '', phone: '', notes: '' };
  constructor() { this.reload(); }
  reload() { this.api.listFosters().subscribe((r) => this.rows.set(r)); }
  create() { this.api.createFoster(this.form).subscribe(() => { this.form = { name: '', city: '', capacity: 1, email: '', phone: '', notes: '' }; this.reload(); }); }
}
