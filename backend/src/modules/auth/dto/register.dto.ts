import { IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsPhoneNumber('UA')
  @IsNotEmpty()
  phone: string;
}
