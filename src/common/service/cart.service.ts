import { Injectable } from '@nestjs/common';
import { CRUDService } from './crud.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../schema/cart.schema';

@Injectable()
export class CartService extends CRUDService<CartDocument> {
  constructor(
    @InjectModel(Cart.name)
    readonly cartDataModel: Model<CartDocument>,
  ) {
    super(cartDataModel);
  }
}
