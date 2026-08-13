import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateAnimalDto, UpdateAnimalDto } from './animals.dto';

export type AnimalRow = {
  id: string;
  user_id: string;
  foster_id: string | null;
  name: string;
  species: string;
  breed: string;
  sex: string;
  age_months: number;
  weight_kg: string | number;
  color: string;
  microchip: string;
  kennel: string;
  status: string;
  intake_date: string;
  notes: string;
  created_at: string;
  foster_name?: string | null;
};

@Injectable()
export class AnimalsService {
  constructor(private readonly db: DatabaseService) {}

  map(row: AnimalRow) {
    return {
      id: row.id,
      fosterId: row.foster_id,
      fosterName: row.foster_name ?? null,
      name: row.name,
      species: row.species,
      breed: row.breed,
      sex: row.sex,
      ageMonths: Number(row.age_months),
      weightKg: Number(row.weight_kg),
      color: row.color,
      microchip: row.microchip,
      kennel: row.kennel,
      status: row.status,
      intakeDate: row.intake_date,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }

  async list(userId: string, filters: { q?: string; status?: string; species?: string }) {
    const rows = await this.db.query<AnimalRow>(
      `select a.*, f.name as foster_name
       from animals a
       left join fosters f on f.id = a.foster_id
       where a.user_id = $1
         and ($2::text is null or a.status = $2)
         and ($3::text is null or a.species = $3)
         and ($4::text is null or a.name ilike '%' || $4 || '%' or a.breed ilike '%' || $4 || '%' or a.microchip ilike '%' || $4 || '%')
       order by a.created_at desc`,
      [userId, filters.status || null, filters.species || null, filters.q || null],
    );
    return rows.map((r) => this.map(r));
  }

  async get(userId: string, id: string) {
    const row = await this.db.queryOne<AnimalRow>(
      `select a.*, f.name as foster_name from animals a left join fosters f on f.id = a.foster_id where a.user_id = $1 and a.id = $2`,
      [userId, id],
    );
    if (!row) throw new NotFoundException('Animal not found');
    return this.map(row);
  }

  async create(userId: string, dto: CreateAnimalDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into animals (id,user_id,foster_id,name,species,breed,sex,age_months,weight_kg,color,microchip,kennel,status,intake_date,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,coalesce($14, current_date),$15)`,
      [
        id, userId, dto.fosterId || null, dto.name, dto.species ?? 'dog', dto.breed ?? '', dto.sex ?? 'unknown',
        dto.ageMonths ?? 12, dto.weightKg ?? 0, dto.color ?? '', dto.microchip ?? '', dto.kennel ?? '',
        dto.status ?? 'intake', dto.intakeDate ?? null, dto.notes ?? '',
      ],
    );
    return this.get(userId, id);
  }

  async update(userId: string, id: string, dto: UpdateAnimalDto) {
    await this.get(userId, id);
    await this.db.exec(
      `update animals set
         name = coalesce($3, name),
         species = coalesce($4, species),
         breed = coalesce($5, breed),
         sex = coalesce($6, sex),
         age_months = coalesce($7, age_months),
         weight_kg = coalesce($8, weight_kg),
         color = coalesce($9, color),
         microchip = coalesce($10, microchip),
         kennel = coalesce($11, kennel),
         status = coalesce($12, status),
         intake_date = coalesce($13, intake_date),
         notes = coalesce($14, notes),
         foster_id = coalesce($15, foster_id)
       where user_id = $1 and id = $2`,
      [
        userId, id, dto.name ?? null, dto.species ?? null, dto.breed ?? null, dto.sex ?? null,
        dto.ageMonths ?? null, dto.weightKg ?? null, dto.color ?? null, dto.microchip ?? null,
        dto.kennel ?? null, dto.status ?? null, dto.intakeDate ?? null, dto.notes ?? null, dto.fosterId ?? null,
      ],
    );
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.db.exec(`delete from animals where user_id = $1 and id = $2`, [userId, id]);
    return { ok: true };
  }
}
