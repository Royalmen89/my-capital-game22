import { create } from 'zustand';
import { PRODUCTS } from '../data/products';
import { getBuildingDef } from '../data/buildingData';

// --- TİPLER ---

export interface GameDate {
  day: number;
  month: number;
  year: number;
}

export interface InventoryItem {
  productId: string;
  quantity: number;
  quality: number;
}

export interface Building {
  id: string;
  name: string;
  type: 'Farm' | 'Factory' | 'Store';
  inventory: InventoryItem[];
}

interface GameState {
  cash: number;
  date: GameDate;
  paused: boolean;
  gameSpeed: number;
  buildings: Building[];

  setPaused: (paused: boolean) => void;
  tickDate: () => void;
  deductCash: (amount: number) => void;
  addCash: (amount: number) => void;
  addTestBuilding: () => void;
  addToInventory: (buildingId: string, productId: string, amount: number) => void;
  sellProduct: (buildingId: string, productId: string, amount: number) => void;
  buyBuilding: (type: string) => void;
  // YENİ: Mal Tüketme
  consumeFromInventory: (buildingId: string, productId: string, amount: number) => boolean;
}

// --- STORE ---

export const useGameStore = create<GameState>((set, get) => ({
  cash: 10000000,
  date: { day: 1, month: 1, year: 2000 },
  paused: true,
  gameSpeed: 1000,
  buildings: [],

  setPaused: (paused) => set({ paused }),
  deductCash: (amount) => set((state) => ({ cash: state.cash - amount })),
  addCash: (amount) => set((state) => ({ cash: state.cash + amount })),

  tickDate: () => set((state) => {
    let { day, month, year } = state.date;
    day++;
    if (day > 30) {
      day = 1;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    return { date: { day, month, year } };
  }),

  // --- DÜZELTİLMİŞ KISIM ---
  addTestBuilding: () => set((state) => {
    // 1. Kontrol: İsmi "Deneme Çiftliği" olan bina zaten var mı?
    const hasFarm = state.buildings.some(b => b.name.includes('Deneme Çiftliği'));
    
    // Varsa hiçbir şey yapma (Boş obje döndür)
    if (hasFarm) return {};

    // Yoksa ekle
    const newBuilding: Building = {
      id: crypto.randomUUID(),
      name: `Deneme Çiftliği A.Ş. (Lv.1)`,
      type: 'Farm',
      inventory: [
        { productId: 'wheat', quantity: 500, quality: 50 }
      ]
    };
    return { buildings: [...state.buildings, newBuilding] };
  }),
  // --------------------------

  addToInventory: (buildingId, productId, amount) => set((state) => {
    const buildings = state.buildings.map((b) => {
      if (b.id !== buildingId) return b;
      const newInventory = [...b.inventory];
      const itemIndex = newInventory.findIndex((i) => i.productId === productId);

      if (itemIndex > -1) {
        newInventory[itemIndex] = {
          ...newInventory[itemIndex],
          quantity: newInventory[itemIndex].quantity + amount,
        };
      } else {
        newInventory.push({ productId, quantity: amount, quality: 50 });
      }
      return { ...b, inventory: newInventory };
    });
    return { buildings };
  }),

  sellProduct: (buildingId, productId, amount) => set((state) => {
    // 1. Önce satılacak binayı ve malı bulalım
    const building = state.buildings.find((b) => b.id === buildingId);
    if (!building) return {};

    const itemIndex = building.inventory.findIndex((i) => i.productId === productId);
    if (itemIndex === -1) return {}; // Mal yoksa iptal

    const item = building.inventory[itemIndex];
    if (item.quantity < amount) return {}; // Yeterli stok yoksa iptal

    // 2. Fiyatı Hesapla (Veritabanından temel fiyatı çekiyoruz)
    const productDef = PRODUCTS[productId];
    const unitPrice = productDef ? productDef.basePrice : 0;
    const totalRevenue = unitPrice * amount;

    // 3. Stoktan Düş ve Parayı Ekle
    // Bu kısım biraz karışık görünebilir ama sadece "Stoku azalt, parayı artır" diyoruz.
    const newBuildings = state.buildings.map((b) => {
      if (b.id !== buildingId) return b;

      const newInventory = [...b.inventory];
      const currentItem = newInventory[itemIndex];

      // Miktarı azalt
      newInventory[itemIndex] = {
        ...currentItem,
        quantity: currentItem.quantity - amount,
      };

      // Eğer miktar 0'a düşerse listeden sil (İsteğe bağlı, şimdilik kalsın)
      return { ...b, inventory: newInventory };
    });

    return {
      buildings: newBuildings,
      cash: state.cash + totalRevenue, // 💰 KASA DOLUYOR!
    };
  }),

  buyBuilding: (type) => set((state) => {
    // 1. Bina bilgilerini ve maliyetini al
    const def = getBuildingDef(type);
    if (!def) return {}; 

    // 2. Paran yetiyor mu kontrol et
    if (state.cash < def.cost) {
      console.log("Yetersiz Bakiye!"); // İstersen buraya bir uyarı popup'ı bağlarız sonra
      return {}; 
    }

    // 3. Yeni binayı oluştur
    const newBuilding: Building = {
      id: crypto.randomUUID(),
      name: `${def.name} #${state.buildings.length + 1}`, // Örn: "Un Fabrikası #2"
      type: def.id as any,
      inventory: [] // Yeni bina boş gelir
    };

    // 4. Parayı düş ve binayı ekle
    return {
      cash: state.cash - def.cost,
      buildings: [...state.buildings, newBuilding]
    };
  }),

  // EN ALTA EKLE: TÜKETİM FONKSİYONU
  consumeFromInventory: (buildingId, productId, amount) => {
    let success = false;

    set((state) => {
      const building = state.buildings.find((b) => b.id === buildingId);
      if (!building) return {}; // Bina yoksa bir şey yapma

      const itemIndex = building.inventory.findIndex((i) => i.productId === productId);
      
      // Mal hiç yoksa veya miktarı yetmiyorsa BAŞARISIZ
      if (itemIndex === -1 || building.inventory[itemIndex].quantity < amount) {
        success = false;
        return {}; 
      }

      // Mal yetiyorsa TÜKET
      success = true;
      const newBuildings = state.buildings.map((b) => {
        if (b.id !== buildingId) return b;

        const newInventory = [...b.inventory];
        const currentItem = newInventory[itemIndex];

        newInventory[itemIndex] = {
          ...currentItem,
          quantity: currentItem.quantity - amount
        };

        return { ...b, inventory: newInventory };
      });

      return { buildings: newBuildings };
    });

    return success; // Engine'e sonucu bildiriyoruz
  }
}));