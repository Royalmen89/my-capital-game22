// src/renderer/src/data/buildingData.ts

export interface BuildingDefinition {
  id: string;
  name: string;
  cost: number; // <--- YENİ: Binanın kurulum maliyeti
  outputs: { productId: string; amountPerDay: number }[];
  inputs: { productId: string; amountPerDay: number }[];
}

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
  Farm: {
    id: 'Farm',
    name: 'Çiftlik',
    cost: 100000, // 100 Bin Dolar
    inputs: [],
    outputs: [{ productId: 'wheat', amountPerDay: 10 }] 
  },
  Factory: {
    id: 'Factory',
    name: 'Un Fabrikası', // İsmini özelleştirelim
    cost: 500000, // 500 Bin Dolar (Daha pahalı)
    inputs: [], 
    outputs: [{ productId: 'flour', amountPerDay: 5 }] // Şimdilik sadece Un üretsin (Girdisiz)
  },
  Store: {
    id: 'Store',
    name: 'Mağaza',
    cost: 50000, // 50 Bin Dolar
    inputs: [],
    outputs: []
  }
};

export const getBuildingDef = (type: string) => BUILDING_DEFINITIONS[type];