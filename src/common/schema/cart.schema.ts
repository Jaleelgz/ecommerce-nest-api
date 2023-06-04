import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Product } from './products.schema';

export type CartDocument = HydratedDocument<Cart>;

@Schema({
  collection: 'products',
  timestamps: true,
  collation: { locale: 'en', strength: 2 },
})
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Product.name })
  productId: string;

  @Prop({ trim: true })
  quantity: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
