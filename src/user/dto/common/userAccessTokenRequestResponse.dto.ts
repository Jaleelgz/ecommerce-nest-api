import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserAccessTokenRequestResponseDTO {
  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  email: string;
}
