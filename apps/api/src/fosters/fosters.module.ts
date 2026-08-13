import { Module } from '@nestjs/common';
import { FostersController } from './fosters.controller';
import { FostersService } from './fosters.service';

@Module({
  controllers: [FostersController],
  providers: [FostersService],
})
export class FostersModule {}
