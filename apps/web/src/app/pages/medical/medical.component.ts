import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Animal, Medical } from '../../core/models';

@Component({
  selector: 'app-medical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div><h1 class="font-display text-3xl font-semibold">Medical</h1><p class="text-sm text-ink-500">Due list and new records</p></div>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" [(ngModel)]="dueSoon" (ngModelChange)="reload()" /> Next 14 days only</label>
    </div>
    <form class="card mt-5 grid gap-3 p-5 sm:grid-cols-4" (ngSubmit)="create()">
      <div><label class="label">Animal</label><select class="input" name="animalId" [(ngModel)]="form.animalId" required>@for (a of animals(); track a.id) { <option [value]="a.id">{{ a.name }}</option> }</select></div>
      <div><label class="label">Kind</label><select class="input" name="kind" [(ngModel)]="form.kind"><option>exam</option><option>vaccine</option><option>medication</option><option>surgery</option><option>note</option></select></div>
      <div class="sm:col-span-2"><label class="label">Title</label><input class="input" name="title" [(ngModel)]="form.title" required /></div>
      <div><label class="label">Given</label><input class="input" type="date" name="givenAt" [(ngModel)]="form.givenAt" /></div>
      <div><label class="label">Next due</label><input class="input" type="date" name="nextDue" [(ngModel)]="form.nextDue" /></div>
      <div class="sm:col-span-2"><label class="label">Notes</label><input class="input" name="notes" [(ngModel)]="form.notes" /></div>
      <div class="sm:col-span-4"><button class="btn-primary" type="submit">Add record</button></div>
    </form>
    <div class="mt-5 space-y-2">
      @for (m of rows(); track m.id) {
        <article class="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div class="font-semibold">{{ m.animalName }} · {{ m.title }}</div>
            <div class="text-sm text-ink-500">{{ m.kind }} · given {{ m.givenAt }}@if (m.nextDue) { · due {{ m.nextDue }} }</div>
          </div>
          <button class="btn-ghost text-sm" type="button" (click)="remove(m)">Remove</button>
        </article>
      }
    </div>
  `,
})
export class MedicalComponent {
  private readonly api = inject(ApiService);
  readonly rows = signal<Medical[]>([]);
  readonly animals = signal<Animal[]>([]);
  dueSoon = true;
  form = { animalId: '', kind: 'exam', title: '', notes: '', givenAt: '', nextDue: '' };
  constructor() {
    this.api.listAnimals().subscribe((a) => { this.animals.set(a); if (a[0]) this.form.animalId = a[0].id; });
    this.reload();
  }
  reload() { this.api.listMedical(this.dueSoon).subscribe((r) => this.rows.set(r)); }
  create() { this.api.createMedical(this.form).subscribe(() => { this.form.title = ''; this.form.notes = ''; this.reload(); }); }
  remove(m: Medical) { this.api.deleteMedical(m.id).subscribe(() => this.reload()); }
}
