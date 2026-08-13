import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateShiftDto, CreateVolunteerDto, UpdateShiftDto, UpdateVolunteerDto } from './volunteers.dto';

@Injectable()
export class VolunteersService {
  constructor(private readonly db: DatabaseService) {}

  async list(userId: string) {
    const rows = await this.db.query<Record<string, unknown>>(`select * from volunteers where user_id = $1 order by name`, [userId]);
    return rows.map((r) => this.mapVol(r));
  }

  private mapVol(r: Record<string, unknown>) {
    return { id: r.id, name: r.name, email: r.email, phone: r.phone, skills: r.skills, status: r.status, createdAt: r.created_at };
  }

  async create(userId: string, dto: CreateVolunteerDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into volunteers (id,user_id,name,email,phone,skills) values ($1,$2,$3,$4,$5,$6)`,
      [id, userId, dto.name, dto.email ?? '', dto.phone ?? '', dto.skills ?? ''],
    );
    const row = await this.db.queryOne<Record<string, unknown>>(`select * from volunteers where id = $1`, [id]);
    return this.mapVol(row!);
  }

  async update(userId: string, id: string, dto: UpdateVolunteerDto) {
    const existing = await this.db.queryOne(`select id from volunteers where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Volunteer not found');
    await this.db.exec(
      `update volunteers set name = coalesce($3,name), email = coalesce($4,email), phone = coalesce($5,phone),
         skills = coalesce($6,skills), status = coalesce($7,status) where user_id = $1 and id = $2`,
      [userId, id, dto.name ?? null, dto.email ?? null, dto.phone ?? null, dto.skills ?? null, dto.status ?? null],
    );
    const row = await this.db.queryOne<Record<string, unknown>>(`select * from volunteers where id = $1`, [id]);
    return this.mapVol(row!);
  }

  async remove(userId: string, id: string) {
    const n = await this.db.exec(`delete from volunteers where user_id = $1 and id = $2`, [userId, id]);
    if (!n) throw new NotFoundException('Volunteer not found');
    return { ok: true };
  }

  async listShifts(userId: string) {
    const rows = await this.db.query<Record<string, unknown>>(
      `select s.*, v.name as volunteer_name from shifts s join volunteers v on v.id = s.volunteer_id
       where s.user_id = $1 order by s.shift_date desc, s.start_time`,
      [userId],
    );
    return rows.map((r) => ({
      id: r.id, volunteerId: r.volunteer_id, volunteerName: r.volunteer_name, shiftDate: r.shift_date,
      startTime: r.start_time, endTime: r.end_time, role: r.role, status: r.status, createdAt: r.created_at,
    }));
  }

  async createShift(userId: string, dto: CreateShiftDto) {
    const vol = await this.db.queryOne(`select id from volunteers where user_id = $1 and id = $2`, [userId, dto.volunteerId]);
    if (!vol) throw new NotFoundException('Volunteer not found');
    const id = randomUUID();
    await this.db.exec(
      `insert into shifts (id,user_id,volunteer_id,shift_date,start_time,end_time,role) values ($1,$2,$3,$4,$5,$6,$7)`,
      [id, userId, dto.volunteerId, dto.shiftDate, dto.startTime ?? '09:00', dto.endTime ?? '13:00', dto.role ?? 'kennel'],
    );
    const list = await this.listShifts(userId);
    return list.find((s) => s.id === id)!;
  }

  async updateShift(userId: string, id: string, dto: UpdateShiftDto) {
    const existing = await this.db.queryOne(`select id from shifts where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Shift not found');
    await this.db.exec(
      `update shifts set shift_date = coalesce($3, shift_date), start_time = coalesce($4, start_time),
         end_time = coalesce($5, end_time), role = coalesce($6, role), status = coalesce($7, status)
       where user_id = $1 and id = $2`,
      [userId, id, dto.shiftDate ?? null, dto.startTime ?? null, dto.endTime ?? null, dto.role ?? null, dto.status ?? null],
    );
    const list = await this.listShifts(userId);
    return list.find((s) => s.id === id)!;
  }

  async removeShift(userId: string, id: string) {
    const n = await this.db.exec(`delete from shifts where user_id = $1 and id = $2`, [userId, id]);
    if (!n) throw new NotFoundException('Shift not found');
    return { ok: true };
  }
}
