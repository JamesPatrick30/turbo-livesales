import {
  IsArray,
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
// import { OrderType, PaymentMethod } from '@prisma/client';

class CreateSaleItemDto {
  @IsString()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateSaleDto {

  @IsEnum(['TAKEAWAY', 'DINE_IN','DELIVERY'])
  orderType!: string;

  @IsEnum(['CASH', 'CARD','GOOGLE_PAY','GCASH',"MAYA","GOTYME"])
  paymentMethod!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];
}