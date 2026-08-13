import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateAdoptionDto, UpdateAdoptionDto } from './adoptions.dto';
import { canOpenAdoption, nextAdoptionStatus, type AdoptionStatus } from '../domain/shelter.rules';

type Row = {
  id: string; animal_id: string; applicant_name: string; email: string; phone: string;
  home_type: string; has_yard: boolean; other_pets: string; status: string; notes: string;
  created_at: string; animal_name?: string;
};

@Injectable()
export class AdoptionsService {
  constructor(private readonly db: DatabaseService) {}

  map(row: Row) {
    return {
      id: row.id, animalId: row.animal_id, animalName: row.animal_name ?? null,
      applicantName: row.applicant_name, email: row.email, phone: row.phone,
      homeType: row.home_type, hasYard: Boolean(row.has_yard), otherPets: row.other_pets,
      status: row.status, notes: row.notes, createdAt: row.created_at,
    };
  }

  async list(userId: string, status?: string) {
    const rows = await this.db.query<Row>(
      `select ad.*, a.name as animal_name from adoptions ad
       join animals a on a.id = ad.animal_id
       where ad.user_id = $1 and ($2::text is null or ad.status = $2)
       order by ad.created_at desc`,
      [userId, status || null],
    );
    return rows.map((r) => this.map(r));
  }

  async create(userId: string, dto: CreateAdoptionDto) {
    const animal = await this.db.queryOne<{ status: string }>(`select status from animals where user_id = $1 and id = $2`, [userId, dto.animalId]);
    if (!animal) throw new NotFoundException('Animal not found');
    if (!canOpenAdoption(animal.status)) throw new BadRequestException('Animal is not open for adoption');
    const id = randomUUID();
    await this.db.exec(
      `insert into adoptions (id,user_id,animal_id,applicant_name,email,phone,home_type,has_yard,other_pets,notes)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, userId, dto.animalId, dto.applicantName, dto.email ?? '', dto.phone ?? '', dto.homeType ?? 'apartment', dto.hasYard ?? false, dto.otherPets ?? '', dto.notes ?? ''],
    );
    const row = await this.db.queryOne<Row>(`select ad.*, a.name as animal_name from adoptions ad join animals a on a.id = ad.animal_id where ad.id = $1`, [id]);
    return this.map(row!);
  }

  async update(userId: string, id: string, dto: UpdateAdoptionDto) {
    const existing = await this.db.queryOne<Row>(`select * from adoptions where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Application not found');
    let status = existing.status;
    if (dto.status) {
      const action = dto.status === 'review' ? 'review' : dto.status === 'approved' ? 'approve' : dto.status === 'denied' ? 'deny' : dto.status === 'withdrawn' ? 'withdraw' : null;
      status = action ? nextAdoptionStatus(existing.status as AdoptionStatus, action) : dto.status;
      if (status === 'approved') {
        await this.db.exec(`update animals set status = 'adopted' where id = $1 and user_id = $2`, [existing.animal_id, userId]);
      }
    }
    await this.db.exec(
      `update adoptions set status = $3, notes = coalesce($4, notes), applicant_name = coalesce($5, applicant_name),
         email = coalesce($6, email), phone = coalesce($7, phone), home_type = coalesce($8, home_type),
         has_yard = coalesce($9, has_yard), other_pets = coalesce($10, other_pets)
       where user_id = $1 and id = $2`,
      [userId, id, status, dto.notes ?? null, dto.applicantName ?? null, dto.email ?? null, dto.phone ?? null, dto.homeType ?? null, dto.hasYard ?? null, dto.otherPets ?? null],
    );
    const row = await this.db.queryOne<Row>(`select ad.*, a.name as animal_name from adoptions ad join animals a on a.id = ad.animal_id where ad.id = $1`, [id]);
    return this.map(row!);
  }

  async remove(userId: string, id: string) {
    const n = await this.db.exec(`delete from adoptions where user_id = $1 and id = $2`, [userId, id]);
    if (!n) throw new NotFoundException('Application not found');
    return { ok: true };
  }
}
