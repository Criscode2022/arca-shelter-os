import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsIn(['food', 'meds', 'supplies']) category?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() minQuantity?: number;
}

export class UpdateItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsIn(['food', 'meds', 'supplies']) category?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsNumber() minQuantity?: number;
}

export class AdjustDto {
  @IsNumber() delta!: number;
}
