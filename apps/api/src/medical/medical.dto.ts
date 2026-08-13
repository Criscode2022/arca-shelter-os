import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalDto {
  @IsString() @IsNotEmpty() animalId!: string;
  @IsOptional() @IsIn(['exam', 'vaccine', 'surgery', 'medication', 'note']) kind?: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() givenAt?: string;
  @IsOptional() @IsString() nextDue?: string;
}

export class UpdateMedicalDto {
  @IsOptional() @IsIn(['exam', 'vaccine', 'surgery', 'medication', 'note']) kind?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() givenAt?: string;
  @IsOptional() @IsString() nextDue?: string;
}
