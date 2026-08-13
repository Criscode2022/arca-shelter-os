import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { CreateMedicalDto, UpdateMedicalDto } from './medical.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class MedicalController {
  constructor(private readonly medical: MedicalService) {}

  @Get('medical')
  list(@CurrentUser() user: AuthUser, @Query('dueSoon') dueSoon?: string) {
    return this.medical.list(user.userId, dueSoon === 'true');
  }

  @Get('animals/:id/medical')
  forAnimal(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.medical.forAnimal(user.userId, id);
  }

  @Post('medical')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMedicalDto) {
    return this.medical.create(user.userId, dto);
  }

  @Patch('medical/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateMedicalDto) {
    return this.medical.update(user.userId, id, dto);
  }

  @Delete('medical/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.medical.remove(user.userId, id);
  }
}
