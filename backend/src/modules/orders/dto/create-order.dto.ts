import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPhoneNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsPhoneNumber('UA')
  @IsNotEmpty()
  recipientPhone: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsNumber()
  @IsNotEmpty()
  customerPrice: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
