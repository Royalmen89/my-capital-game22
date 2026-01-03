import { useGameStore } from '../../store/useGameStore';
import { getBuildingDef } from '../../data/buildingData';

export const runProduction = () => {
  // consumeFromInventory fonksiyonunu da çekiyoruz
  const { buildings, addToInventory, consumeFromInventory } = useGameStore.getState();

  buildings.forEach((building) => {
    const def = getBuildingDef(building.type);
    if (!def) return;

    // 1. GİRDİ KONTROLÜ (INPUT CHECK)
    // Eğer binanın girdiye ihtiyacı varsa (Fabrika gibi)
    let canProduce = true;

    if (def.inputs.length > 0) {
      // Tüm girdiler depoda var mı?
      for (const input of def.inputs) {
        // consumeFromInventory hem kontrol eder hem siler.
        // Eğer false dönerse, mal yoktur, üretim iptal.
        const consumed = consumeFromInventory(building.id, input.productId, input.amountPerDay);
        if (!consumed) {
          canProduce = false;
          // console.log(`${building.name} üretimi durdu: ${input.productId} eksik!`);
          break; // Bir tane bile eksikse üretimi durdur
        }
      }
    }

    // 2. ÜRETİM (OUTPUT)
    // Sadece girdiler tamamsa üretim yap
    if (canProduce) {
      def.outputs.forEach((output) => {
        addToInventory(building.id, output.productId, output.amountPerDay);
      });
    }
  });
};