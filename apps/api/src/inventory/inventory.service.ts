import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../database/database.service';
import { CreateItemDto, UpdateItemDto } from './inventory.dto';
import { inventoryIsLow } from '../domain/shelter.rules';

type Row = { id: string; name: string; category: string; quantity: string | number; unit: string; min_quantity: string | number; created_at: string };

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  map(row: Row) {
    const quantity = Number(row.quantity);
    const minQuantity = Number(row.min_quantity);
    return {
      id: row.id, name: row.name, category: row.category, quantity, unit: row.unit, minQuantity,
      low: inventoryIsLow(quantity, minQuantity), createdAt: row.created_at,
    };
  }

  async list(userId: string) {
    const rows = await this.db.query<Row>(`select * from inventory_items where user_id = $1 order by category, name`, [userId]);
    return rows.map((r) => this.map(r));
  }

  async create(userId: string, dto: CreateItemDto) {
    const id = randomUUID();
    await this.db.exec(
      `insert into inventory_items (id,user_id,name,category,quantity,unit,min_quantity) values ($1,$2,$3,$4,$5,$6,$7)`,
      [id, userId, dto.name, dto.category ?? 'supplies', dto.quantity ?? 0, dto.unit ?? 'units', dto.minQuantity ?? 0],
    );
    const row = await this.db.queryOne<Row>(`select * from inventory_items where id = $1`, [id]);
    return this.map(row!);
  }

  async update(userId: string, id: string, dto: UpdateItemDto) {
    const existing = await this.db.queryOne(`select id from inventory_items where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Item not found');
    await this.db.exec(
      `update inventory_items set name = coalesce($3,name), category = coalesce($4,category),
         quantity = coalesce($5,quantity), unit = coalesce($6,unit), min_quantity = coalesce($7,min_quantity)
       where user_id = $1 and id = $2`,
      [userId, id, dto.name ?? null, dto.category ?? null, dto.quantity ?? null, dto.unit ?? null, dto.minQuantity ?? null],
    );
    const row = await this.db.queryOne<Row>(`select * from inventory_items where id = $1`, [id]);
    return this.map(row!);
  }

  async adjust(userId: string, id: string, delta: number) {
    const existing = await this.db.queryOne<Row>(`select * from inventory_items where user_id = $1 and id = $2`, [userId, id]);
    if (!existing) throw new NotFoundException('Item not found');
    const next = Math.max(0, Number(existing.quantity) + Number(delta));
    await this.db.exec(`update inventory_items set quantity = $3 where user_id = $1 and id = $2`, [userId, id, next]);
    const row = await this.db.queryOne<Row>(`select * from inventory_items where id = $1`, [id]);
    return this.map(row!);
  }

  async remove(userId: string, id: string) {
    const n = await this.db.exec(`delete from inventory_items where user_id = $1 and id = $2`, [userId, id]);
    if (!n) throw new NotFoundException('Item not found');
    return { ok: true };
  }
}
