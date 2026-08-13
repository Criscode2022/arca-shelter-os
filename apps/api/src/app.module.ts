import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AnimalsModule } from './animals/animals.module';
import { MedicalModule } from './medical/medical.module';
import { FostersModule } from './fosters/fosters.module';
import { AdoptionsModule } from './adoptions/adoptions.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { InventoryModule } from './inventory/inventory.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AnimalsModule,
    MedicalModule,
    FostersModule,
    AdoptionsModule,
    VolunteersModule,
    InventoryModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
