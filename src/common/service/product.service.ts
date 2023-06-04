import { Injectable } from '@nestjs/common';
import { CRUDService } from './crud.service';
import { Product, ProductDocument } from '../schema/products.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductService extends CRUDService<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    readonly productDataModel: Model<ProductDocument>,
  ) {
    super(productDataModel);
  }
}
