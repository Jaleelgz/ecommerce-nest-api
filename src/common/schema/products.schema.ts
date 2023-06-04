import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  collection: 'products',
  timestamps: true,
  collation: { locale: 'en', strength: 2 },
})
export class Product {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: string;

  @Prop({ trim: true })
  name: string;

  @Prop({ trim: true })
  price: string;

  @Prop({ trim: true })
  rating: string;

  @Prop({ trim: true })
  image: string;

  @Prop({ trim: true })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
