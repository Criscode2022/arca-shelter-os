import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Animal } from '../../core/models';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div><h1 class="font-display text-3xl font-semibold">Animals</h1><p class="text-sm text-ink-500">{{ rows().length }} on the books</p></div>
      <button class="btn-primary" type="button" (click)="showForm.set(!showForm())">{{ showForm() ? 'Close' : 'New intake' }}</button>
    </div>
    <div class="mt-4 flex flex-wrap gap-2">
      <input class="input max-w-xs" placeholder="Search name, breed, chip" [(ngModel)]="q" (ngModelChange)="reload()" />
      <select class="input max-w-[10rem]" [(ngModel)]="status" (ngModelChange)="reload()">
        <option value="">All statuses</option>
        @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
      </select>
    </div>
    @if (showForm()) {
      <form class="card mt-4 grid gap-3 p-5 sm:grid-cols-3" (ngSubmit)="create()">
        <div><label class="label">Name</label><input class="input" name="name" [(ngModel)]="form.name" required /></div>
        <div><label class="label">Species</label><select class="input" name="species" [(ngModel)]="form.species"><option>dog</option><option>cat</option><option>rabbit</option><option>other</option></select></div>
        <div><label class="label">Breed</label><input class="input" name="breed" [(ngModel)]="form.breed" /></div>
        <div><label class="label">Sex</label><select class="input" name="sex" [(ngModel)]="form.sex"><option>female</option><option>male</option><option>unknown</option></select></div>
        <div><label class="label">Kennel</label><input class="input" name="kennel" [(ngModel)]="form.kennel" /></div>
        <div><label class="label">Status</label><select class="input" name="status" [(ngModel)]="form.status">@for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }</select></div>
        <div class="sm:col-span-3"><button class="btn-primary" type="submit">Save intake</button></div>
      </form>
    }
    <div class="mt-5 grid gap-3 md:grid-cols-2">
      @for (a of rows(); track a.id) {
        <article class="card p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-display text-xl">{{ a.name }}</h2>
              <p class="text-sm text-ink-500">{{ a.species }} · {{ a.breed || 'mix' }} · {{ a.sex }} · {{ a.ageMonths }} mo</p>
            </div>
            <span class="badge" [class]="badge(a.status)">{{ a.status }}</span>
          </div>
          <p class="mt-3 text-sm text-ink-600">{{ a.kennel ? 'Kennel ' + a.kennel : (a.fosterName ? 'Foster · ' + a.fosterName : 'No location') }}</p>
          <p class="mt-1 text-xs text-ink-400">In {{ a.intakeDate }}{{ a.microchip ? ' · chip ' + a.microchip : '' }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            @for (s of statuses; track s) {
              <button type="button" class="btn-secondary !px-2 !py-1 text-xs" (click)="setStatus(a, s)">{{ s }}</button>
            }
          </div>
        </article>
      }
    </div>
  `,
})
export class AnimalsComponent {
  private readonly api = inject(ApiService);
  readonly rows = signal<Animal[]>([]);
  readonly showForm = signal(false);
  readonly statuses = ['intake', 'medical', 'available', 'foster', 'adopted', 'archived'];
  q = '';
  status = '';
  form = { name: '', species: 'dog', breed: '', sex: 'unknown', kennel: '', status: 'intake' };

  constructor() { this.reload(); }
  reload() { this.api.listAnimals(this.q || undefined, this.status || undefined).subscribe((r) => this.rows.set(r)); }
  create() {
    this.api.createAnimal(this.form).subscribe(() => { this.showForm.set(false); this.form = { name: '', species: 'dog', breed: '', sex: 'unknown', kennel: '', status: 'intake' }; this.reload(); });
  }
  setStatus(a: Animal, status: string) { this.api.updateAnimal(a.id, { status }).subscribe(() => this.reload()); }
  badge(status: string) {
    if (status === 'available') return 'badge bg-moss-500/10 text-moss-700';
    if (status === 'medical') return 'badge bg-clay-500/10 text-clay-700';
    if (status === 'adopted') return 'badge bg-ink-100 text-ink-600';
    return 'badge bg-ink-900/5 text-ink-700';
  }
}
