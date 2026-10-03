import { IsPhoneNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsPhoneNumber('UA')
  phone: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
