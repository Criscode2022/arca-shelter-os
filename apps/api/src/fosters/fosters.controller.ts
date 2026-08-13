import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FostersService } from './fosters.service';
import { CreateFosterDto, UpdateFosterDto } from './fosters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('fosters')
export class FostersController {
  constructor(private readonly fosters: FostersService) {}

  @Get() list(@CurrentUser() user: AuthUser) { return this.fosters.list(user.userId); }
  @Post() create(@CurrentUser() user: AuthUser, @Body() dto: CreateFosterDto) { return this.fosters.create(user.userId, dto); }
  @Patch(':id') update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateFosterDto) { return this.fosters.update(user.userId, id, dto); }
  @Delete(':id') remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.fosters.remove(user.userId, id); }
}
