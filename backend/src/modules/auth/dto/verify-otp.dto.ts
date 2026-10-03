import { IsPhoneNumber, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber('UA')
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
