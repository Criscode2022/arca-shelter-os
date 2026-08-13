import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto, UpdateAnimalDto } from './animals.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animals: AnimalsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('q') q?: string, @Query('status') status?: string, @Query('species') species?: string) {
    return this.animals.list(user.userId, { q, status, species });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.animals.get(user.userId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAnimalDto) {
    return this.animals.create(user.userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateAnimalDto) {
    return this.animals.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.animals.remove(user.userId, id);
  }
}
