import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PGlite } from '@electric-sql/pglite';
import { Pool, type QueryResultRow } from 'pg';
import { randomUUID } from 'crypto';

type QueryResult<T> = { rows: T[]; rowCount: number | null };

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;
  private pglite: PGlite | null = null;
  private mode: 'neon' | 'pglite' = 'pglite';
  public source: 'neon' | 'pglite' = 'pglite';

  async onModuleInit() {
    const url = process.env.DATABASE_URL?.trim();
    if (url) {
      this.pool = new Pool({
        connectionString: url,
        ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: false },
        max: 10,
      });
      this.mode = 'neon';
      this.source = 'neon';
      this.logger.log('Connected to Neon / Postgres via DATABASE_URL');
    } else {
      this.pglite = new PGlite();
      this.mode = 'pglite';
      this.source = 'pglite';
      this.logger.log('DATABASE_URL unset — using embedded PGLite');
    }
    await this.migrate();
    await this.seedIfEmpty();
  }

  async onModuleDestroy() {
    await this.pool?.end();
    await this.pglite?.close();
  }

  private async rawQuery<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    if (this.mode === 'neon' && this.pool) {
      const res = await this.pool.query<T>(text, params);
      return { rows: res.rows, rowCount: res.rowCount };
    }
    const res = await this.pglite!.query(text, params);
    return { rows: (res.rows as T[]) ?? [], rowCount: res.rows?.length ?? 0 };
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
    const res = await this.rawQuery<T>(text, params);
    return res.rows;
  }

  async queryOne<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  async exec(text: string, params: unknown[] = []): Promise<number> {
    const res = await this.rawQuery(text, params);
    return res.rowCount ?? 0;
  }

  private async migrate() {
    const statements = [
      `create table if not exists users (
        id text primary key,
        email text not null unique,
        password_hash text not null,
        name text not null,
        shelter_name text not null default '',
        phone text not null default '',
        city text not null default '',
        kennel_capacity integer not null default 24,
        created_at timestamptz not null default now()
      )`,
      `create table if not exists fosters (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        email text not null default '',
        phone text not null default '',
        city text not null default '',
        capacity integer not null default 1,
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create table if not exists animals (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        foster_id text references fosters(id) on delete set null,
        name text not null,
        species text not null default 'dog',
        breed text not null default '',
        sex text not null default 'unknown',
        age_months integer not null default 12,
        weight_kg numeric(6,2) not null default 0,
        color text not null default '',
        microchip text not null default '',
        kennel text not null default '',
        status text not null default 'intake',
        intake_date date not null default current_date,
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create index if not exists animals_user_id_idx on animals(user_id)`,
      `create table if not exists medical_records (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        animal_id text not null references animals(id) on delete cascade,
        kind text not null default 'exam',
        title text not null,
        notes text not null default '',
        given_at date not null default current_date,
        next_due date,
        created_at timestamptz not null default now()
      )`,
      `create index if not exists medical_animal_id_idx on medical_records(animal_id)`,
      `create table if not exists adoptions (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        animal_id text not null references animals(id) on delete cascade,
        applicant_name text not null,
        email text not null default '',
        phone text not null default '',
        home_type text not null default 'apartment',
        has_yard boolean not null default false,
        other_pets text not null default '',
        status text not null default 'new',
        notes text not null default '',
        created_at timestamptz not null default now()
      )`,
      `create table if not exists volunteers (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        email text not null default '',
        phone text not null default '',
        skills text not null default '',
        status text not null default 'active',
        created_at timestamptz not null default now()
      )`,
      `create table if not exists shifts (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        volunteer_id text not null references volunteers(id) on delete cascade,
        shift_date date not null,
        start_time text not null default '09:00',
        end_time text not null default '13:00',
        role text not null default 'kennel',
        status text not null default 'scheduled',
        created_at timestamptz not null default now()
      )`,
      `create table if not exists inventory_items (
        id text primary key,
        user_id text not null references users(id) on delete cascade,
        name text not null,
        category text not null default 'supplies',
        quantity numeric(10,2) not null default 0,
        unit text not null default 'units',
        min_quantity numeric(10,2) not null default 0,
        created_at timestamptz not null default now()
      )`,
    ];
    for (const sql of statements) await this.exec(sql);
    this.logger.log('Migrations applied');
  }

  private async seedIfEmpty() {
    const existing = await this.queryOne<{ c: string }>(`select count(*)::text as c from users`);
    if (existing && Number(existing.c) > 0) return;

    const bcrypt = await import('bcrypt');
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await this.exec(
      `insert into users (id, email, password_hash, name, shelter_name, phone, city, kennel_capacity)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [userId, 'nina.vega@arca.rescue', passwordHash, 'Nina Vega', 'Arca Madrid', '+34 612 880 441', 'Madrid', 18],
    );

    const f1 = randomUUID();
    const f2 = randomUUID();
    const f3 = randomUUID();
    const fosters: [string, string, string, string, string, number, string][] = [
      [f1, 'Clara Moya', 'clara.moya@email.com', '+34 600 221 118', 'Leganes', 2, 'Quiet house. Experienced with galgos.'],
      [f2, 'Hugo Serra', 'hugo.serra@email.com', '+34 622 334 009', 'Alcala', 1, 'Weekend-only, cats preferred.'],
      [f3, 'Irene Soler', 'irene.soler@email.com', '+34 655 118 773', 'Getafe', 3, 'Fenced garden. Can do medical foster.'],
    ];
    for (const [id, name, email, phone, city, capacity, notes] of fosters) {
      await this.exec(
        `insert into fosters (id,user_id,name,email,phone,city,capacity,notes) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [id, userId, name, email, phone, city, capacity, notes],
      );
    }

    const a1 = randomUUID();
    const a2 = randomUUID();
    const a3 = randomUUID();
    const a4 = randomUUID();
    const a5 = randomUUID();
    const a6 = randomUUID();
    const a7 = randomUUID();
    const a8 = randomUUID();
    const animals: [string, string | null, string, string, string, string, number, number, string, string, string, string, string, string][] = [
      [a1, null, 'Canela', 'dog', 'Podenco mix', 'female', 28, 16.4, 'sand', '981000123456789', 'A3', 'available', '2026-05-12', 'Street intake. Excellent with people.'],
      [a2, null, 'Ombra', 'cat', 'Domestic shorthair', 'female', 14, 3.2, 'black', '981000223344556', 'ISO-2', 'medical', '2026-07-28', 'URI. Isolation until clear.'],
      [a3, f1, 'Paco', 'dog', 'Galgo', 'male', 48, 27.1, 'brindle', '981000998877665', '', 'foster', '2026-03-02', 'Thin on arrival. Thriving in foster.'],
      [a4, null, 'Lila', 'cat', 'Domestic longhair', 'female', 20, 3.8, 'grey', '981000112233445', 'C1', 'available', '2026-06-18', 'Lap cat. Fine with calm dogs.'],
      [a5, null, 'Bruno', 'dog', 'Mastin mix', 'male', 36, 34.0, 'fawn', '981000667788990', 'B1', 'medical', '2026-07-04', 'Heartworm protocol week 3.'],
      [a6, null, 'Nube', 'rabbit', 'Lionhead', 'female', 10, 1.6, 'white', '', 'R2', 'available', '2026-08-01', 'Surrender. Bonded? unknown.'],
      [a7, null, 'Tilo', 'dog', 'Bodeguero', 'male', 18, 11.2, 'white-tan', '981000554433221', '', 'adopted', '2026-04-09', 'Adopted 12 Aug. Follow-up booked.'],
      [a8, null, 'Menta', 'cat', 'Tabby', 'male', 6, 2.4, 'orange', '', 'INTAKE', 'intake', '2026-08-11', 'Kitten. Waiting on FIV/FeLV.'],
    ];
    for (const row of animals) {
      await this.exec(
        `insert into animals (id,user_id,foster_id,name,species,breed,sex,age_months,weight_kg,color,microchip,kennel,status,intake_date,notes)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [row[0], userId, row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], row[12], row[13]],
      );
    }

    const meds: [string, string, string, string, string, string | null][] = [
      [a1, 'vaccine', 'Rabies 2026', 'Nobivac. No reaction.', '2026-05-20', '2027-05-20'],
      [a1, 'vaccine', 'DHPPi booster', 'Annual due next spring.', '2026-05-20', '2027-05-20'],
      [a2, 'exam', 'URI check', 'Congestion improving. Continue doxycycline.', '2026-08-10', '2026-08-17'],
      [a2, 'medication', 'Doxycycline', '10 days remaining.', '2026-08-08', '2026-08-18'],
      [a3, 'exam', 'Weight check', '27.1 kg. Target 29.', '2026-08-02', '2026-08-30'],
      [a5, 'medication', 'Heartworm adulticide', 'Week 3 of protocol. Restricted exercise.', '2026-07-20', '2026-08-20'],
      [a5, 'exam', 'Cardiology review', 'Murmur stable.', '2026-08-06', '2026-08-20'],
      [a8, 'exam', 'Intake panel', 'Awaiting FIV/FeLV.', '2026-08-11', '2026-08-14'],
      [a4, 'vaccine', 'RCP booster', 'Due this month.', '2025-08-20', '2026-08-20'],
    ];
    for (const [animalId, kind, title, notes, givenAt, nextDue] of meds) {
      await this.exec(
        `insert into medical_records (id,user_id,animal_id,kind,title,notes,given_at,next_due)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), userId, animalId, kind, title, notes, givenAt, nextDue],
      );
    }

    const apps: [string, string, string, string, string, boolean, string, string, string][] = [
      [a1, 'Lucia Herrera', 'lucia.herrera@email.com', '+34 600 112 334', 'house', true, 'One senior cat', 'new', 'Garden. Works from home three days.'],
      [a4, 'Javier Romero', 'j.romero@email.com', '+34 622 441 009', 'apartment', false, 'None', 'review', 'Fourth floor with lift. Quiet building.'],
      [a3, 'Ines Costa', 'ines.costa@email.com', '+34 655 773 201', 'house', true, 'One galgo already', 'approved', 'Home check passed. Pickup Saturday.'],
    ];
    for (const [animalId, name, email, phone, home, yard, other, status, notes] of apps) {
      await this.exec(
        `insert into adoptions (id,user_id,animal_id,applicant_name,email,phone,home_type,has_yard,other_pets,status,notes)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [randomUUID(), userId, animalId, name, email, phone, home, yard, other, status, notes],
      );
    }

    const v1 = randomUUID();
    const v2 = randomUUID();
    const v3 = randomUUID();
    const vols: [string, string, string, string, string][] = [
      [v1, 'Marta Gil', 'marta.gil@email.com', '+34 611 220 118', 'walking, intake'],
      [v2, 'Pablo Ruiz', 'pablo.ruiz@email.com', '+34 633 101 444', 'kennel, laundry'],
      [v3, 'Sofia Nadal', 'sofia.nadal@email.com', '+34 644 550 221', 'social media, transport'],
    ];
    for (const [id, name, email, phone, skills] of vols) {
      await this.exec(
        `insert into volunteers (id,user_id,name,email,phone,skills,status) values ($1,$2,$3,$4,$5,$6,'active')`,
        [id, userId, name, email, phone, skills],
      );
    }

    const shifts: [string, string, string, string, string, string][] = [
      [v1, '2026-08-15', '09:00', '13:00', 'walking', 'scheduled'],
      [v2, '2026-08-15', '08:00', '12:00', 'kennel', 'scheduled'],
      [v3, '2026-08-16', '10:00', '14:00', 'transport', 'scheduled'],
      [v1, '2026-08-09', '09:00', '13:00', 'walking', 'done'],
    ];
    for (const [volId, date, start, end, role, status] of shifts) {
      await this.exec(
        `insert into shifts (id,user_id,volunteer_id,shift_date,start_time,end_time,role,status)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [randomUUID(), userId, volId, date, start, end, role, status],
      );
    }

    const stock: [string, string, number, string, number][] = [
      ['Adult kibble', 'food', 42, 'kg', 20],
      ['Puppy kibble', 'food', 6, 'kg', 10],
      ['Wet cat food', 'food', 38, 'tins', 24],
      ['Doxycycline 100mg', 'meds', 18, 'tabs', 12],
      ['Flea treatment', 'meds', 9, 'pipettes', 8],
      ['Fleece blankets', 'supplies', 14, 'units', 8],
      ['Litter', 'supplies', 3, 'bags', 6],
    ];
    for (const [name, category, qty, unit, min] of stock) {
      await this.exec(
        `insert into inventory_items (id,user_id,name,category,quantity,unit,min_quantity) values ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), userId, name, category, qty, unit, min],
      );
    }

    this.logger.log('Seeded demo account nina.vega@arca.rescue / demo1234');
  }
}
