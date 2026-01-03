// src/renderer/src/data/products.ts

export type ProductType = 'Raw' | 'Semi' | 'Consumer';

export interface ProductDefinition {
  id: string;
  name: string;
  type: ProductType;
  basePrice: number; // Piyasa başlangıç fiyatı
}

// Oyundaki tüm ürünlerin "Kimlik Kartı" burasıdır
export const PRODUCTS: Record<string, ProductDefinition> = {
  wheat: { id: 'wheat', name: 'Buğday', type: 'Raw', basePrice: 20 },
  flour: { id: 'flour', name: 'Un', type: 'Semi', basePrice: 50 },
  bread: { id: 'bread', name: 'Ekmek', type: 'Consumer', basePrice: 120 },
  water: { id: 'water', name: 'Su', type: 'Raw', basePrice: 5 },
};

// Yardımcı fonksiyon: ID'den ürün ismini bulmak için
export const getProduct = (id: string) => PRODUCTS[id];