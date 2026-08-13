import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { kennelOccupancy, inventoryIsLow } from '../domain/shelter.rules';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async summary(userId: string) {
    const user = await this.db.queryOne<{ kennel_capacity: number; shelter_name: string }>(
      `select kennel_capacity, shelter_name from users where id = $1`,
      [userId],
    );
    const animals = await this.db.query<{ status: string; species: string }>(
      `select status, species from animals where user_id = $1`,
      [userId],
    );
    const occupancy = kennelOccupancy(animals, Number(user?.kennel_capacity ?? 24));
    const byStatus: Record<string, number> = {};
    const bySpecies: Record<string, number> = {};
    for (const a of animals) {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      bySpecies[a.species] = (bySpecies[a.species] ?? 0) + 1;
    }

    const due = await this.db.query<{ id: string; title: string; next_due: string; animal_name: string; kind: string }>(
      `select m.id, m.title, m.next_due, m.kind, a.name as animal_name
       from medical_records m join animals a on a.id = m.animal_id
       where m.user_id = $1 and m.next_due is not null and m.next_due <= current_date + interval '14 days'
       order by m.next_due asc limit 8`,
      [userId],
    );

    const pending = await this.db.query<{ id: string; applicant_name: string; status: string; animal_name: string }>(
      `select ad.id, ad.applicant_name, ad.status, a.name as animal_name
       from adoptions ad join animals a on a.id = ad.animal_id
       where ad.user_id = $1 and ad.status in ('new','review') order by ad.created_at desc limit 8`,
      [userId],
    );

    const stock = await this.db.query<{ name: string; quantity: string | number; min_quantity: string | number; unit: string }>(
      `select name, quantity, min_quantity, unit from inventory_items where user_id = $1`,
      [userId],
    );
    const lowStock = stock
      .filter((s) => inventoryIsLow(Number(s.quantity), Number(s.min_quantity)))
      .map((s) => ({ name: s.name, quantity: Number(s.quantity), unit: s.unit, minQuantity: Number(s.min_quantity) }));

    const upcomingShifts = await this.db.query<{ shift_date: string; start_time: string; role: string; volunteer_name: string }>(
      `select s.shift_date, s.start_time, s.role, v.name as volunteer_name
       from shifts s join volunteers v on v.id = s.volunteer_id
       where s.user_id = $1 and s.status = 'scheduled' and s.shift_date >= current_date
       order by s.shift_date, s.start_time limit 6`,
      [userId],
    );

    return {
      shelterName: user?.shelter_name ?? 'Shelter',
      occupancy,
      totals: {
        animals: animals.length,
        available: byStatus.available ?? 0,
        medical: byStatus.medical ?? 0,
        foster: byStatus.foster ?? 0,
        adopted: byStatus.adopted ?? 0,
        intake: byStatus.intake ?? 0,
      },
      byStatus,
      bySpecies,
      dueMedical: due.map((d) => ({ id: d.id, title: d.title, nextDue: d.next_due, animalName: d.animal_name, kind: d.kind })),
      pendingAdoptions: pending.map((p) => ({ id: p.id, applicantName: p.applicant_name, status: p.status, animalName: p.animal_name })),
      lowStock,
      upcomingShifts: upcomingShifts.map((s) => ({
        date: s.shift_date, startTime: s.start_time, role: s.role, volunteerName: s.volunteer_name,
      })),
    };
  }
}
