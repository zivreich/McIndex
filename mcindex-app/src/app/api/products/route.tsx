import { NextResponse } from 'next/server';
import productsFileContent from '@/data/products.json';

interface ProductDetails {
  name: string;
  description: string;
  category: string;
  unit: string;
  emoji: string;
}

interface ProductsFileData {
  [key: string]: ProductDetails;
}

const productsData: ProductsFileData = productsFileContent as ProductsFileData;

export async function GET() {
  const productList = Object.keys(productsData).map(productId => {
    return {
      id: productId,
      ...productsData[productId]
    };
  });

  return NextResponse.json({ products: productList });
}