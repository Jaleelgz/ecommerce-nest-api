import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, UseGuards, Put, Post, Param } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CartService } from '../service/cart.service';
import { ProductService } from '../service/product.service';
import { CartResponseDTO } from '../dto/response/cart.response';
import { UserAuthGuard } from 'src/user/guards/userAuth.guard';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  @Get('all')
  @ApiOperation({
    description: 'Retrieves all cart items',
  })
  @ApiResponse({ type: [CartResponseDTO] })
  @UseGuards(UserAuthGuard)
  async getCartItems() {}

  @Put('remove/:productId')
  @ApiOperation({
    description: 'Retrieves all cart items',
  })
  @ApiResponse({ type: [CartResponseDTO] })
  @UseGuards(UserAuthGuard)
  async removeFromCart(@Param('productId') productId: string) {}

  @Post('add/:productId')
  @ApiOperation({
    description: 'Retrieves all cart items',
  })
  @ApiResponse({ type: [CartResponseDTO] })
  @UseGuards(UserAuthGuard)
  async addToCart(@Param('productId') productId: string) {}
}
