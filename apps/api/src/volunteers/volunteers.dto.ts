import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVolunteerDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() skills?: string;
}

export class UpdateVolunteerDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() skills?: string;
  @IsOptional() @IsIn(['active', 'paused']) status?: string;
}

export class CreateShiftDto {
  @IsString() @IsNotEmpty() volunteerId!: string;
  @IsString() @IsNotEmpty() shiftDate!: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsString() role?: string;
}

export class UpdateShiftDto {
  @IsOptional() @IsString() shiftDate?: string;
  @IsOptional() @IsString() startTime?: string;
  @IsOptional() @IsString() endTime?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsIn(['scheduled', 'done', 'cancelled']) status?: string;
}
