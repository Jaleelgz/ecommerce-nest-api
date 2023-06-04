import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductRequestDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  price: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  rating: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Expose()
  stock: number;
}
