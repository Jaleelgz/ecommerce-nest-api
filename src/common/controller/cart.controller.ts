import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  UseGuards,
  Put,
  Post,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CartService } from '../service/cart.service';
import { ProductService } from '../service/product.service';
import { CartResponseDTO } from '../dto/response/cart.response';
import { UserAuthGuard } from 'src/user/guards/userAuth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { UserResponseDTO } from 'src/user/dto/response/userResponse.dto';
import { plainToClass } from 'class-transformer';
import { AuthToken } from 'src/user/decorators/authToken.decorator';
import { IDecodedIdToken } from 'src/user/interface/iDecodedIdToken';
import { Cart } from '../schema/cart.schema';

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
  async getCartItems(
    @User() user: UserResponseDTO,
    @AuthToken() token: IDecodedIdToken,
  ): Promise<CartResponseDTO[]> {
    const aggregation = `[
      {
        $match: {
          $expr: {
            $eq: ['$userId', { $toObjectId: '${token.userId}' }],
          },
        },
      },

      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },

      {
        $addFields: {
          product: {
            $map: {
              input: '$product',
              in: {
                name: '$$this.name',
                image: '$$this.image',
                productId: '$$this._id',
                stock: '$$this.stock',
                rating: '$$this.rating',
                price: '$$this.price',
              },
            },
          },
        },
      },

      {
        $unwind: '$product',
      },

      {
        $project: {
          id: '$product.productId',
          cartId: '$_id',
          name: '$product.name',
          image: '$product.image',
          stock: '$product.stock',
          rating: '$product.rating',
          price: '$product.price',
          quantity: '$quantity',
        },
      },
    ]`;

    const cartRes = await this.cartService.groupedList(aggregation);

    if (!cartRes) {
      return [];
    }

    const retRes = cartRes.map((cartItem) => this.toCartModel(cartItem));
    return retRes;
  }

  @Put('remove/:productId')
  @ApiOperation({
    description: 'Retrieves all cart items',
  })
  @ApiResponse({ type: [CartResponseDTO] })
  @UseGuards(UserAuthGuard)
  async removeFromCart(
    @Param('productId') productId: string,
    @AuthToken() token: IDecodedIdToken,
  ): Promise<CartResponseDTO> {
    let isDelete = false;
    const session = await this.connection.startSession();
    session.startTransaction();

    const cartItem = await this.cartService.get({
      productId: productId,
      userId: token.userId,
    });
    const productItem = await this.cartService.get({ _id: productId });

    if (cartItem.quantity === 1) {
      isDelete = true;
    }

    try {
      let cartResult: Cart | any;

      if (isDelete) {
        cartResult = await this.cartService.delete(
          { productId: productId, userId: token.userId },
          session,
        );
      } else {
        cartResult = await this.cartService.update(
          { productId: productId, userId: token.userId },
          { quantity: cartItem.quantity - 1 },
          session,
        );
      }

      const productResult = await this.productService.update(
        { _id: productId },
        { stock: productItem.stock + 1 },
        session,
      );

      await session.commitTransaction();
      await session.endSession();

      if (!cartResult) throw new NotFoundException('Item not found!');

      const returnModel = this.toCartModel({
        ...cartResult,
        ...productResult,
        id: productId,
        cartId: cartResult?._id ? cartResult?._id : cartResult?.id,
      });
      return returnModel;
    } catch (e) {
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(e);
    }
  }

  @Post('add/:productId')
  @ApiOperation({
    description: 'Retrieves all cart items',
  })
  @ApiResponse({ type: [CartResponseDTO] })
  @UseGuards(UserAuthGuard)
  async addToCart(
    @Param('productId') productId: string,
    @AuthToken() token: IDecodedIdToken,
  ): Promise<CartResponseDTO> {
    let isNew = false;
    const session = await this.connection.startSession();
    session.startTransaction();

    const cartItem = await this.cartService.get({
      productId: productId,
      userId: token.userId,
    });
    const productItem = await this.cartService.get({ _id: productId });

    if (!cartItem) {
      isNew = true;
    }

    try {
      let cartResult: Cart | any;

      if (isNew) {
        cartResult = await this.cartService.create(
          { productId: productId, userId: token.userId, quantity: 1 },
          session,
        );
      } else {
        cartResult = await this.cartService.update(
          { productId: productId, userId: token.userId },
          { quantity: cartItem.quantity + 1 },
          session,
        );
      }

      const productResult = await this.productService.update(
        { _id: productId },
        { stock: productItem.stock - 1 },
        session,
      );

      await session.commitTransaction();
      await session.endSession();

      if (!cartResult) throw new NotFoundException('Item not found!');

      const returnModel = this.toCartModel({
        ...cartResult,
        ...productResult,
        id: productId,
        cartId: cartResult?._id ? cartResult?._id : cartResult?.id,
      });
      return returnModel;
    } catch (e) {
      await session.abortTransaction();
      await session.endSession();
      throw new BadRequestException(e);
    }
  }

  private toCartModel(entity: any): CartResponseDTO {
    return plainToClass(CartResponseDTO, entity, {
      excludeExtraneousValues: true,
    });
  }
}
