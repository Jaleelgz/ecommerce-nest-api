import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserResponseDTO {
  @ApiProperty()
  @Transform(({ key, obj }) =>
    obj['_id'] ? obj['_id']?.toString() : obj[key]?.toString(),
  )
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  address?: string;
}
