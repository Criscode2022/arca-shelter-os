import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdoptionDto {
  @IsString() @IsNotEmpty() animalId!: string;
  @IsString() @IsNotEmpty() applicantName!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsIn(['apartment', 'house', 'other']) homeType?: string;
  @IsOptional() @IsBoolean() hasYard?: boolean;
  @IsOptional() @IsString() otherPets?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateAdoptionDto {
  @IsOptional() @IsIn(['new', 'review', 'approved', 'denied', 'withdrawn']) status?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() applicantName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsIn(['apartment', 'house', 'other']) homeType?: string;
  @IsOptional() @IsBoolean() hasYard?: boolean;
  @IsOptional() @IsString() otherPets?: string;
}
