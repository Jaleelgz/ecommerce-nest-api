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
import { Product } from '../schema/products.schema';

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
    @User() user: any,
    @AuthToken() token: IDecodedIdToken,
  ): Promise<CartResponseDTO[]> {
    const aggregation = `[
      {
        $match: {
          $expr: {
            $eq: ['$userId', { $toObjectId: '${
              token.userId ? token.userId : user._id ? user._id : user.id
            }' }],
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
          _id:0,
          id: '$productId',
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
    @User() user: any,
  ): Promise<CartResponseDTO> {
    let isDelete = false;
    const session = await this.connection.startSession();
    session.startTransaction();

    const cartItem = await this.cartService.get({
      productId: productId,
      userId: user._id ? user._id : user.id,
    });

    const productItem = await this.productService.get({ _id: productId });

    if (!productItem) {
      throw new BadRequestException('Product not found!');
    }

    if (!cartItem) {
      throw new BadRequestException('Product not found in cart!');
    }

    if (cartItem?.quantity === 1) {
      isDelete = true;
    }

    try {
      let cartResult: Cart | any;

      if (isDelete) {
        cartResult = await this.cartService.delete(
          { productId: productId, userId: user._id ? user._id : user.id },
          session,
        );
      } else {
        cartResult = await this.cartService.update(
          { productId: productId, userId: user._id ? user._id : user.id },
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
        id: productId,
        cartId: cartItem?._id ? cartItem?._id : cartItem?.id,
        name: productItem.name,
        image: productItem.image,
        price: productItem.price,
        stock: productItem.stock + 1,
        rating: productItem.rating,
        quantity: cartItem.quantity - 1,
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
    @User() user: any,
  ): Promise<CartResponseDTO> {
    let isNew = false;
    const session = await this.connection.startSession();
    session.startTransaction();

    const cartItem = await this.cartService.get({
      productId: productId,
      userId: user._id ? user._id : user.id,
    });

    const productItem: Product = await this.productService.get({
      _id: productId,
    });

    if (!productItem) {
      throw new BadRequestException('Product not found!');
    }

    if (!cartItem) {
      isNew = true;
    }

    try {
      let cartResult: Cart | any;

      if (isNew) {
        cartResult = await this.cartService.create(
          {
            productId: productId,
            userId: user._id ? user._id : user.id,
            quantity: 1,
          },
          session,
        );
      } else {
        cartResult = await this.cartService.update(
          { productId: productId, userId: user._id ? user._id : user.id },
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
        id: productId,
        cartId: cartResult?._id ? cartResult?._id : cartResult?.id,
        name: productItem.name,
        image: productItem.image,
        price: productItem.price,
        stock: productItem.stock - 1,
        rating: productItem.rating,
        quantity: isNew ? 1 : cartItem.quantity + 1,
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
