import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  health() {
    return {
      ok: true,
      service: 'arca-api',
      source: this.db.source,
      time: new Date().toISOString(),
    };
  }
}
