import { useGameStore } from '../store/useGameStore';
import { runProduction } from './systems/ProductionSystem';

class GameLoop {
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.timer) return; // Zaten çalışıyorsa elleme

    const { gameSpeed, paused } = useGameStore.getState();
    if (paused) return;

    console.log("Motor çalıştı...");
    
    // Döngüyü başlat
    this.timer = setInterval(() => {
      this.tick();
    }, gameSpeed);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log("Motor durdu.");
    }
  }

  // Her "Tick"te (Oyun gününde) ne olacak?
  private tick() {
    const store = useGameStore.getState();

    // 1. Tarihi ilerlet
    store.tickDate();

    // 2. ÜRETİM SİSTEMİNİ ÇALIŞTIR (YENİ)
    runProduction();

    // 3. Günlük Giderler
    const dailyRunningCost = 150; 
    store.deductCash(dailyRunningCost);
  }

  // Hız değişirse veya pause basılırsa motoru yeniden ayarla
  update() {
    this.stop();
    this.start();
  }
}

export const gameLoop = new GameLoop();