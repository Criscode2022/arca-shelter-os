import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateShiftDto, CreateVolunteerDto, UpdateShiftDto, UpdateVolunteerDto } from './volunteers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class VolunteersController {
  constructor(private readonly volunteers: VolunteersService) {}

  @Get('volunteers') list(@CurrentUser() user: AuthUser) { return this.volunteers.list(user.userId); }
  @Post('volunteers') create(@CurrentUser() user: AuthUser, @Body() dto: CreateVolunteerDto) { return this.volunteers.create(user.userId, dto); }
  @Patch('volunteers/:id') update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateVolunteerDto) { return this.volunteers.update(user.userId, id, dto); }
  @Delete('volunteers/:id') remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.volunteers.remove(user.userId, id); }
  @Get('shifts') shifts(@CurrentUser() user: AuthUser) { return this.volunteers.listShifts(user.userId); }
  @Post('shifts') createShift(@CurrentUser() user: AuthUser, @Body() dto: CreateShiftDto) { return this.volunteers.createShift(user.userId, dto); }
  @Patch('shifts/:id') updateShift(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateShiftDto) { return this.volunteers.updateShift(user.userId, id, dto); }
  @Delete('shifts/:id') removeShift(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.volunteers.removeShift(user.userId, id); }
}
