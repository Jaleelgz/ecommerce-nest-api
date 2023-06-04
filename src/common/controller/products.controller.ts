import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  NotFoundException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import { ProductResponseDTO } from '../dto/response/product.response';
import { ProductDocument } from '../schema/products.schema';
import { plainToClass } from 'class-transformer';
import { CreateProductRequestDTO } from '../dto/request/createProductRequest.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('all')
  @ApiOperation({
    description: 'Retrieves all products',
  })
  @ApiResponse({ type: [ProductResponseDTO] })
  async getProducts(): Promise<ProductResponseDTO[]> {
    const productList = await this.productService.list(null, null, null, null);

    if (!productList || productList.length === 0) return [];

    const retRes = productList.map((product) => this.toProductModel(product));
    return retRes;
  }

  @Get(':id')
  @ApiOperation({
    description: 'Retrieves product by Id',
  })
  @ApiResponse({ type: ProductResponseDTO })
  async getProductById(@Param('id') id: string): Promise<ProductResponseDTO> {
    const product = await this.productService.get({ _id: id });

    if (!product) throw new NotFoundException('Product Not Found!');

    const retRes = this.toProductModel(product);
    return retRes;
  }

  @Post('all')
  @ApiOperation({
    description: 'Add products',
  })
  @ApiResponse({ type: ProductResponseDTO })
  @ApiBody({ type: [CreateProductRequestDTO] })
  async addProducts(@Body() body: CreateProductRequestDTO[]): Promise<any> {
    const productsRes = await this.productService.createAll(body);

    if (!productsRes) {
      throw new BadRequestException();
    }

    return productsRes;
  }

  private toProductModel(entity: ProductDocument): ProductResponseDTO {
    return plainToClass(ProductResponseDTO, entity, {
      excludeExtraneousValues: true,
    });
  }
}
