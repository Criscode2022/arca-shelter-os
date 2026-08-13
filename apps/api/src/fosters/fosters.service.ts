import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateFosterDto, UpdateFosterDto } from './fosters.dto';

type Row = {
  id: string; name: string; email: string; phone: string; city: string;
  capacity: number; notes: string; created_at: string; placed?: string;
};

@Injectable()
export class FostersService {
  constructor(private readonly db: DatabaseService) {}

  map(row: Row) {
    return {
      id: row.id, name: row.name, email: row.email, phone: row.phone, city: row.city,
      capacity: Number(row.capacity), notes: row.notes, createdAt: row.created_at,
      placed: Number(row.placed ?? 0),
    };
  }

  async list(userId: string) {
    const rows = await this.db.query<Row>(
      `select f.*, (select count(*)::text from animals a where a.foster_id = f.id and a.status = 'foster') as placed
       from fosters f where f.user_id = $1 order by f.name`,
      [userId],
    );
    return rows.map((r) => this.map(r));
  }

  async create(userId: string, dto: CreateFosterDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into fosters (id,user_id,name,email,phone,city,capacity,notes) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, userId, dto.name, dto.email ?? '', dto.phone ?? '', dto.city ?? '', dto.capacity ?? 1, dto.notes ?? ''],
    );
    const row = await this.db.queryOne<Row>(`select * from fosters where id = $1`, [id]);
    return this.map(row!);
  }

  async update(userId: string, id: string, dto: UpdateFosterDto) {
    const existing = await this.db.queryOne(`select id from fosters where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Foster not found');
    await this.db.exec(
      `update fosters set name = coalesce($3,name), email = coalesce($4,email), phone = coalesce($5,phone),
         city = coalesce($6,city), capacity = coalesce($7,capacity), notes = coalesce($8,notes)
       where user_id = $1 and id = $2`,
      [userId, id, dto.name ?? null, dto.email ?? null, dto.phone ?? null, dto.city ?? null, dto.capacity ?? null, dto.notes ?? null],
    );
    const row = await this.db.queryOne<Row>(`select * from fosters where id = $1`, [id]);
    return this.map(row!);
  }

  async remove(userId: string, id: string) {
    const n = await this.db.exec(`delete from fosters where user_id = $1 and id = $2`, [userId, id]);
    if (!n) throw new NotFoundException('Foster not found');
    return { ok: true };
  }
}
