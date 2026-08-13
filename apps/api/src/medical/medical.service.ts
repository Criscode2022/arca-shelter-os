import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateMedicalDto, UpdateMedicalDto } from './medical.dto';

type Row = {
  id: string;
  animal_id: string;
  kind: string;
  title: string;
  notes: string;
  given_at: string;
  next_due: string | null;
  created_at: string;
  animal_name?: string;
};

@Injectable()
export class MedicalService {
  constructor(private readonly db: DatabaseService) {}

  map(row: Row) {
    return {
      id: row.id,
      animalId: row.animal_id,
      animalName: row.animal_name ?? null,
      kind: row.kind,
      title: row.title,
      notes: row.notes,
      givenAt: row.given_at,
      nextDue: row.next_due,
      createdAt: row.created_at,
    };
  }

  async list(userId: string, dueSoon = false) {
    const rows = await this.db.query<Row>(
      `select m.*, a.name as animal_name
       from medical_records m
       join animals a on a.id = m.animal_id
       where m.user_id = $1
         and ($2::boolean is false or (m.next_due is not null and m.next_due <= current_date + interval '14 days'))
       order by coalesce(m.next_due, m.given_at) asc`,
      [userId, dueSoon],
    );
    return rows.map((r) => this.map(r));
  }

  async forAnimal(userId: string, animalId: string) {
    const rows = await this.db.query<Row>(
      `select m.*, a.name as animal_name from medical_records m join animals a on a.id = m.animal_id
       where m.user_id = $1 and m.animal_id = $2 order by m.given_at desc`,
      [userId, animalId],
    );
    return rows.map((r) => this.map(r));
  }

  async create(userId: string, dto: CreateMedicalDto) {
    const animal = await this.db.queryOne(`select id from animals where user_id = $1 and id = $2`, [userId, dto.animalId]);
    if (!animal) throw new NotFoundException('Animal not found');
    const id = randomUUID();
    await this.db.exec(
      `insert into medical_records (id,user_id,animal_id,kind,title,notes,given_at,next_due)
       values ($1,$2,$3,$4,$5,$6,coalesce($7, current_date),$8)`,
      [id, userId, dto.animalId, dto.kind ?? 'exam', dto.title, dto.notes ?? '', dto.givenAt ?? null, dto.nextDue ?? null],
    );
    const row = await this.db.queryOne<Row>(
      `select m.*, a.name as animal_name from medical_records m join animals a on a.id = m.animal_id where m.id = $1`,
      [id],
    );
    return this.map(row!);
  }

  async update(userId: string, id: string, dto: UpdateMedicalDto) {
    const existing = await this.db.queryOne(`select id from medical_records where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Record not found');
    await this.db.exec(
      `update medical_records set
         kind = coalesce($3, kind), title = coalesce($4, title), notes = coalesce($5, notes),
         given_at = coalesce($6, given_at), next_due = coalesce($7, next_due)
       where user_id = $1 and id = $2`,
      [userId, id, dto.kind ?? null, dto.title ?? null, dto.notes ?? null, dto.givenAt ?? null, dto.nextDue ?? null],
    );
    const row = await this.db.queryOne<Row>(
      `select m.*, a.name as animal_name from medical_records m join animals a on a.id = m.animal_id where m.id = $1`,
      [id],
    );
    return this.map(row!);
  }

  async remove(userId: string, id: string) {
    const n = await this.db.exec(`delete from medical_records where user_id = $1 and id = $2`, [userId, id]);
    if (!n) throw new NotFoundException('Record not found');
    return { ok: true };
  }
}
