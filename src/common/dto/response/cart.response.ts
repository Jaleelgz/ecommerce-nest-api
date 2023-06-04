import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class CartResponseDTO {
  @ApiProperty()
  @Transform(({ key, obj }) =>
    obj['_id'] ? obj['_id']?.toString() : obj[key]?.toString(),
  )
  @Expose()
  id: string;

  @ApiProperty()
  @Transform(({ key, obj }) => obj[key]?.toString())
  @Expose()
  cartId: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  price: string;

  @ApiProperty()
  @Expose()
  rating: string;

  @ApiProperty()
  @Expose()
  image: string;

  @ApiProperty()
  @Expose()
  stock: number;

  @ApiProperty()
  @Expose()
  quantity: number;
}
