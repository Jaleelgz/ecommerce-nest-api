import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpRequestDTO {
  @ApiProperty({
    title: 'Email Id',
    example: 'abcd@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  @Expose()
  email: string;

  @ApiProperty({
    title: 'Phone',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  phone: string;

  @ApiProperty({
    title: 'Name',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty({
    title: 'Address',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Expose()
  address?: string;
}
