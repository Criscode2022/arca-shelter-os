import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdoptionsService } from './adoptions.service';
import { CreateAdoptionDto, UpdateAdoptionDto } from './adoptions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('adoptions')
export class AdoptionsController {
  constructor(private readonly adoptions: AdoptionsService) {}

  @Get() list(@CurrentUser() user: AuthUser, @Query('status') status?: string) { return this.adoptions.list(user.userId, status); }
  @Post() create(@CurrentUser() user: AuthUser, @Body() dto: CreateAdoptionDto) { return this.adoptions.create(user.userId, dto); }
  @Patch(':id') update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateAdoptionDto) { return this.adoptions.update(user.userId, id, dto); }
  @Delete(':id') remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.adoptions.remove(user.userId, id); }
}
