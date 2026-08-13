import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustDto, CreateItemDto, UpdateItemDto } from './inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get() list(@CurrentUser() user: AuthUser) { return this.inventory.list(user.userId); }
  @Post() create(@CurrentUser() user: AuthUser, @Body() dto: CreateItemDto) { return this.inventory.create(user.userId, dto); }
  @Patch(':id') update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateItemDto) { return this.inventory.update(user.userId, id, dto); }
  @Post(':id/adjust') adjust(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AdjustDto) { return this.inventory.adjust(user.userId, id, dto.delta); }
  @Delete(':id') remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.inventory.remove(user.userId, id); }
}
