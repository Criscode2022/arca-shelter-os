import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Adoption, Animal, AuthResponse, Dashboard, Foster, Medical, Shift, Stock, User, Volunteer } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  login(email: string, password: string) { return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password }); }
  register(payload: { email: string; password: string; name: string; shelterName?: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
  }
  me() { return this.http.get<User>(`${this.base}/auth/me`); }
  updateProfile(payload: Partial<User>) { return this.http.patch<User>(`${this.base}/auth/me`, payload); }
  dashboard() { return this.http.get<Dashboard>(`${this.base}/dashboard`); }

  listAnimals(q?: string, status?: string, species?: string) {
    let p = new HttpParams();
    if (q) p = p.set('q', q);
    if (status) p = p.set('status', status);
    if (species) p = p.set('species', species);
    return this.http.get<Animal[]>(`${this.base}/animals`, { params: p });
  }
  createAnimal(body: Record<string, unknown>) { return this.http.post<Animal>(`${this.base}/animals`, body); }
  updateAnimal(id: string, body: Record<string, unknown>) { return this.http.patch<Animal>(`${this.base}/animals/${id}`, body); }
  deleteAnimal(id: string) { return this.http.delete(`${this.base}/animals/${id}`); }

  listMedical(dueSoon = false) {
    return this.http.get<Medical[]>(`${this.base}/medical`, { params: dueSoon ? { dueSoon: 'true' } : {} });
  }
  createMedical(body: Record<string, unknown>) { return this.http.post<Medical>(`${this.base}/medical`, body); }
  deleteMedical(id: string) { return this.http.delete(`${this.base}/medical/${id}`); }

  listFosters() { return this.http.get<Foster[]>(`${this.base}/fosters`); }
  createFoster(body: Record<string, unknown>) { return this.http.post<Foster>(`${this.base}/fosters`, body); }
  updateFoster(id: string, body: Record<string, unknown>) { return this.http.patch<Foster>(`${this.base}/fosters/${id}`, body); }
  deleteFoster(id: string) { return this.http.delete(`${this.base}/fosters/${id}`); }

  listAdoptions(status?: string) {
    let p = new HttpParams();
    if (status) p = p.set('status', status);
    return this.http.get<Adoption[]>(`${this.base}/adoptions`, { params: p });
  }
  createAdoption(body: Record<string, unknown>) { return this.http.post<Adoption>(`${this.base}/adoptions`, body); }
  updateAdoption(id: string, body: Record<string, unknown>) { return this.http.patch<Adoption>(`${this.base}/adoptions/${id}`, body); }

  listVolunteers() { return this.http.get<Volunteer[]>(`${this.base}/volunteers`); }
  createVolunteer(body: Record<string, unknown>) { return this.http.post<Volunteer>(`${this.base}/volunteers`, body); }
  listShifts() { return this.http.get<Shift[]>(`${this.base}/shifts`); }
  createShift(body: Record<string, unknown>) { return this.http.post<Shift>(`${this.base}/shifts`, body); }
  updateShift(id: string, body: Record<string, unknown>) { return this.http.patch<Shift>(`${this.base}/shifts/${id}`, body); }

  listInventory() { return this.http.get<Stock[]>(`${this.base}/inventory`); }
  createItem(body: Record<string, unknown>) { return this.http.post<Stock>(`${this.base}/inventory`, body); }
  adjustItem(id: string, delta: number) { return this.http.post<Stock>(`${this.base}/inventory/${id}/adjust`, { delta }); }
}
