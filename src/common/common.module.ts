import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/products.schema';
import { Cart, CartSchema } from './schema/cart.schema';
import { ProductService } from './service/product.service';
import { CartService } from './service/cart.service';
import { ProductController } from './controller/products.controller';
import { CartController } from './controller/cart.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
  ],
  providers: [ProductService, CartService],
  controllers: [ProductController, CartController],
  exports: [],
})
export class CommonModule {}
