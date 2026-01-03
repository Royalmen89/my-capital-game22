import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { gameLoop } from './engine/GameLoop';
import { getProduct } from './data/products';
import { BUILDING_DEFINITIONS } from './data/buildingData';

function App() {
  const { cash, date, paused, setPaused, buildings, addTestBuilding, sellProduct, buyBuilding } = useGameStore();

  // 1. MOTORU KONTROL ET
  useEffect(() => {
    if (paused) gameLoop.stop();
    else gameLoop.start();
  }, [paused]);

  // 2. BAŞLANGIÇTA BİNA EKLE (Bu kısım çok önemli!)
  useEffect(() => {
    // Bina listesi boşsa veya doluysa fark etmez, fonksiyonu çağır.
    // Fonksiyon artık kendi içinde "zaten var mı?" kontrolü yapıyor.
    addTestBuilding();
  }, []); // Sadece ilk açılışta 1 kere çalışır

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col items-center p-10 font-mono overflow-hidden">
      
      {/* ÜST PANEL */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-2xl text-center mb-8">
        <h1 className="text-2xl font-bold mb-2 text-white">CAPITALISM CLONE</h1>
        <div className="text-5xl font-bold text-green-500 mb-2">{formatMoney(cash)}</div>
        <div className="text-xl text-gray-400 mb-4">{date.day}.{date.month}.{date.year}</div>
        
        <button
          onClick={() => setPaused(!paused)}
          className={`px-8 py-2 rounded uppercase font-bold tracking-wider ${
            paused ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-700 hover:bg-green-600'
          }`}
        >
          {paused ? '▶ OYUNU BAŞLAT' : '⏸ DURAKLAT'}
        </button>
        <div className="mt-2 text-xs text-gray-500">Durum: {paused ? 'Durduruldu' : 'Çalışıyor'}</div>
      </div>

      {/* --- YENİ: İNŞAAT MENÜSÜ --- */}
      <div className="w-full max-w-4xl mb-6">
        <h2 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Yeni Yatırım Yap</h2>
        <div className="flex gap-4">
          {Object.values(BUILDING_DEFINITIONS).map((def) => (
            <button
              key={def.id}
              onClick={() => buyBuilding(def.id)}
              disabled={cash < def.cost} // Paran yetmiyorsa buton pasif olsun
              className={`flex-1 p-4 rounded border transition-all flex flex-col items-center justify-center gap-2 ${
                cash >= def.cost 
                  ? 'bg-gray-800 border-gray-600 hover:border-yellow-500 hover:bg-gray-700 cursor-pointer' 
                  : 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="font-bold text-lg">{def.name}</span>
              <span className="text-yellow-500 font-bold text-sm">${def.cost.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
      {/* --------------------------- */}

      {/* BİNA LİSTESİ */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Binalarım ({buildings.length})</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map((building) => (
            <div key={building.id} className="bg-gray-800 p-4 rounded border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{building.name}</h3>
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">{building.type}</span>
              </div>
              
              {/* Envanter - CSS Düzeltmesi Yapılmış Hali */}
              <div className="text-sm text-gray-400 bg-gray-900 p-2 rounded">
                <p className="text-xs text-gray-500 uppercase mb-1">Depo Durumu:</p>
                {building.inventory.map((item, index) => {
                  const productInfo = getProduct(item.productId);
                  const canSell = item.quantity >= 100; // En az 100 ton varsa satabilsin

                  return (
                    <div key={index} className="flex justify-between items-center gap-4 border-b border-gray-800 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
                      
                      {/* Ürün İsmi ve Miktarı */}
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{productInfo ? productInfo.name : item.productId}</span>
                        <span className="text-xs text-gray-500">{item.quantity} ton stok</span>
                      </div>

                      {/* SATIŞ BUTONU */}
                      <button
                        onClick={() => sellProduct(building.id, item.productId, 100)}
                        disabled={!canSell}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                          canSell 
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        SAT (100t) <br/>
                        <span className="opacity-70">${(productInfo?.basePrice || 0) * 100}</span>
                      </button>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;