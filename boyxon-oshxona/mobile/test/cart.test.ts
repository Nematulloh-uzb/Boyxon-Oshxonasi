import {
  oraliqJami,
  savatSoni,
  umumiyJami,
  useSavat,
  yetkazishNarxi,
} from '../src/store/cart.store';

function tasdiq(shart: boolean, nom: string): void {
  if (!shart) throw new Error(`❌ ${nom}`);
  console.log(`✅ ${nom}`);
}

const savat = useSavat.getState();
savat.tozalash();
savat.qoshish({ id: 'osh', nom: 'To‘y oshi', narx: 45000, rasmUrl: '' }, 2);
savat.qoshish({ id: 'jiz', nom: 'Jiz', narx: 28000, rasmUrl: '' }, 2);

let holat = useSavat.getState();
tasdiq(savatSoni(holat) === 4, 'savatchadagi mahsulotlar soni');
tasdiq(oraliqJami(holat) === 146000, 'haqiqiy Zustand store oraliq jami');
tasdiq(yetkazishNarxi(holat) === 14000, 'yetkazish narxi');

holat.promoQoyish('BOYXON20', 29200);
holat = useSavat.getState();
tasdiq(umumiyJami(holat) === 130800, 'promo qo‘llangan yakuniy jami');

holat.miqdor('osh', 1);
holat = useSavat.getState();
tasdiq(holat.promoKod === null && holat.chegirma === 0, 'miqdor o‘zgarganda promo bekor bo‘ladi');
tasdiq(oraliqJami(holat) === 101000, 'miqdor o‘zgargandan keyingi jami');

holat.tozalash();
tasdiq(yetkazishNarxi(useSavat.getState()) === 0, 'bo‘sh savatda yetkazish narxi nol');
