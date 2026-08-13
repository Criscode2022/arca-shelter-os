import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsIn(['dog', 'cat', 'rabbit', 'other'])
  species?: string;

  @IsOptional() @IsString() breed?: string;
  @IsOptional() @IsIn(['female', 'male', 'unknown']) sex?: string;
  @IsOptional() @IsInt() @Min(0) ageMonths?: number;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() microchip?: string;
  @IsOptional() @IsString() kennel?: string;
  @IsOptional() @IsIn(['intake', 'medical', 'available', 'foster', 'adopted', 'archived']) status?: string;
  @IsOptional() @IsString() intakeDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() fosterId?: string;
}

export class UpdateAnimalDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsIn(['dog', 'cat', 'rabbit', 'other']) species?: string;
  @IsOptional() @IsString() breed?: string;
  @IsOptional() @IsIn(['female', 'male', 'unknown']) sex?: string;
  @IsOptional() @IsInt() @Min(0) ageMonths?: number;
  @IsOptional() @IsNumber() weightKg?: number;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() microchip?: string;
  @IsOptional() @IsString() kennel?: string;
  @IsOptional() @IsIn(['intake', 'medical', 'available', 'foster', 'adopted', 'archived']) status?: string;
  @IsOptional() @IsString() intakeDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() fosterId?: string;
}
