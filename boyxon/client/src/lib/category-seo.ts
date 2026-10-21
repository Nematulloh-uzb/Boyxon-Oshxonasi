import type { SeoLang } from './seo';

export interface CategorySeoCopy {
  /** <title> (brend bilan). */
  title: string;
  /** Meta description, 140–160 belgi. */
  description: string;
  /** Ko'rinadigan H1. */
  h1: string;
  /** H1 ostidagi qisqa izoh. */
  subtitle: string;
  /** Kategoriya haqida noyob matn (2–3 gap). */
  content: string;
  /** Meta keywords. */
  keywords: string;
  /** Breadcrumb va ichki havolalar uchun qisqa nom. */
  crumb: string;
}

/**
 * Kategoriya landing sahifalari uchun noyob SEO matnlari.
 *
 * Nega alohida fayl? Har bir kategoriya uchun bir xil shablon emas, real
 * taomlar va qidiruv so'rovlariga mos matn kerak. Tarjimalar shu yerda
 * markazlashgan — yangi kategoriya qo'shilsa, shu obyektga yoziladi.
 */
export const CATEGORY_SEO: Record<string, Record<SeoLang, CategorySeoCopy>> = {
  shorvalar: {
    uz: {
      title: "Sho'rvalar yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Mastava, shurva va moshxurda — issiq va to'yimli sho'rvalar. Toshkent bo'ylab 30–45 daqiqada yetkazib berish, har kuni 9:00–23:00.",
      h1: "Sho'rvalar — Toshkentda issiq yetkazib berish",
      subtitle:
        "Mastava, shurva va moshxurda — har kuni yangi pishirilgan, issiq holda yetkaziladi.",
      content:
        "Sho'rva — o'zbek dasturxonining ajralmas qismi. Boyxon Oshxonasida mastava, go'shtli shurva va moshxurda tayyorlanadi. Har bir porsiya buyurtmadan keyin issiq holda, 30–45 daqiqada Toshkent bo'ylab yetkazib beriladi.",
      keywords: "sho'rva yetkazib berish, mastava, shurva, moshxurda, Toshkent, issiq sho'rva buyurtma",
      crumb: "Sho'rvalar",
    },
    ru: {
      title: "Доставка супов в Ташкенте — Boyxon Oshxonasi",
      description:
        "Мастава, шурпа и мошхурда — горячие и сытные супы. Доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Супы — горячая доставка в Ташкенте",
      subtitle: "Мастава, шурпа и мошхурда — готовим ежедневно и доставляем горячими.",
      content:
        "Суп — неотъемлемая часть узбекского стола. В Boyxon Oshxonasi готовят маставу, шурпу с мясом и мошхурду. Каждую порцию доставляем горячей по Ташкенту за 30–45 минут после заказа.",
      keywords: "доставка супа, мастава, шурпа, мошхурда, Ташкент, заказать суп",
      crumb: "Супы",
    },
    en: {
      title: "Soup delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Mastava, shurpa and moshkhurda — hot, hearty soups. Delivered across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Soups — hot delivery in Tashkent",
      subtitle: "Mastava, shurpa and moshkhurda — cooked daily and delivered hot.",
      content:
        "Soup is an essential part of the Uzbek table. Boyxon Oshxonasi prepares mastava, meat shurpa and moshkhurda. Every portion is delivered hot across Tashkent within 30–45 minutes of ordering.",
      keywords: "soup delivery, mastava, shurpa, moshkhurda, Tashkent, order soup",
      crumb: "Soups",
    },
  },
  palovlar: {
    uz: {
      title: "Palov yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Boyxon to'y oshi, Samarqand oshi va tovuq palov. Toshkent bo'ylab 30–45 daqiqada issiq yetkazib berish, har kuni 9:00–23:00.",
      h1: "Palov — Toshkentda issiq yetkazib berish",
      subtitle:
        "Boyxon to'y oshi, Samarqand oshi va tovuq palov — qozonda, yangi pishirilgan.",
      content:
        "Palov — o'zbek oshxonasining eng mashhur taomi. Boyxon Oshxonasida go'sht va sabzavotlardan tayyorlangan Boyxon to'y oshi, Samarqand oshi va tovuq palov bor. Buyurtma qilganingizdan so'ng issiq holda, 30–45 daqiqada yetkazib beramiz.",
      keywords:
        "palov yetkazib berish, to'y oshi, Samarqand oshi, tovuq palov, Toshkent, palov buyurtma qilish",
      crumb: "Palovlar",
    },
    ru: {
      title: "Доставка плова в Ташкенте — Boyxon Oshxonasi",
      description:
        "Свадебный плов Boyxon, самаркандский плов и плов с курицей. Горячая доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Плов — горячая доставка в Ташкенте",
      subtitle:
        "Свадебный плов Boyxon, самаркандский плов и плов с курицей — свежий, из казана.",
      content:
        "Плов — самое известное блюдо узбекской кухни. В Boyxon Oshxonasi есть свадебный плов Boyxon, самаркандский плов и плов с курицей. Готовим в казане и доставляем горячим по Ташкенту за 30–45 минут.",
      keywords:
        "доставка плова, свадебный плов, самаркандский плов, плов с курицей, Ташкент, заказать плов",
      crumb: "Плов",
    },
    en: {
      title: "Pilaf delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Boyxon wedding pilaf, Samarkand pilaf and chicken pilaf. Delivered hot across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Pilaf — hot delivery in Tashkent",
      subtitle:
        "Boyxon wedding pilaf, Samarkand pilaf and chicken pilaf — fresh from the kazan.",
      content:
        "Pilaf is the most famous dish of Uzbek cuisine. Boyxon Oshxonasi offers Boyxon wedding pilaf, Samarkand pilaf and chicken pilaf. Cooked in a kazan and delivered hot across Tashkent within 30–45 minutes.",
      keywords:
        "pilaf delivery, wedding pilaf, Samarkand pilaf, chicken pilaf, Tashkent, order pilaf",
      crumb: "Pilaf",
    },
  },
  somsa: {
    uz: {
      title: "Somsa yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Gushtli, qovoqli va kartoshkali somsa. Toshkent bo'ylab 30–45 daqiqada issiq yetkazib berish, har kuni 9:00–23:00.",
      h1: "Somsa — Toshkentda tandirdan issiq yetkazib berish",
      subtitle: "Gushtli, qovoqli va kartoshkali somsa — tandirda pishirilgan, qarsildoq.",
      content:
        "Somsa — tandirning eng mazali sovg'asi. Boyxon Oshxonasida an'anaviy gushtli somsa, qovoqli somsa va kartoshkali somsa tayyorlanadi. Xamiri yupqa, ichi suvli va qarsildoq; buyurtmadan so'ng issiq holda yetkaziladi.",
      keywords:
        "somsa yetkazib berish, gushtli somsa, qovoqli somsa, kartoshkali somsa, Toshkent, somsa buyurtma",
      crumb: "Somsa",
    },
    ru: {
      title: "Доставка самсы в Ташкенте — Boyxon Oshxonasi",
      description:
        "Самса с мясом, тыквой и картофелем. Горячая доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Самса — горячая доставка из тандыра в Ташкенте",
      subtitle: "Самса с мясом, тыквой и картофелем — из тандыра, с хрустящей корочкой.",
      content:
        "Самса — самый вкусный подарок тандыра. В Boyxon Oshxonasi готовят традиционную самсу с мясом, самсу с тыквой и самсу с картофелем. Тонкое тесто, сочная начинка и хрустящая корочка; доставляем горячей после заказа.",
      keywords:
        "доставка самсы, самса с мясом, самса с тыквой, самса с картофелем, Ташкент, заказать самсу",
      crumb: "Самса",
    },
    en: {
      title: "Samsa delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Samsa with meat, pumpkin and potato. Delivered hot across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Samsa — hot tandoor delivery in Tashkent",
      subtitle: "Meat, pumpkin and potato samsa — baked in the tandoor, crisp outside.",
      content:
        "Samsa is the tandoor's tastiest gift. Boyxon Oshxonasi bakes traditional meat samsa, pumpkin samsa and potato samsa. Thin pastry, juicy filling and a crisp crust; delivered hot after ordering.",
      keywords: "samsa delivery, meat samsa, pumpkin samsa, potato samsa, Tashkent, order samsa",
      crumb: "Samsa",
    },
  },
  kaboblar: {
    uz: {
      title: "Kabob yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Jiz kabob, qiyma kabob va tovuq shashlik. Toshkent bo'ylab 30–45 daqiqada issiq yetkazib berish, har kuni 9:00–23:00.",
      h1: "Kaboblar — Toshkentda issiq yetkazib berish",
      subtitle: "Jiz kabob, qiyma kabob va tovuq shashlik — cho'g'da, yangi pishirilgan.",
      content:
        "Kabob — kechki dasturxonning eng sevimli taomi. Boyxon Oshxonasida jiz kabob, qiyma kabob va tovuq shashlik cho'g'da pishiriladi. Issiq, xushbo'y va suvli holda Toshkent bo'ylab yetkazib beriladi.",
      keywords:
        "kabob yetkazib berish, jiz kabob, qiyma kabob, tovuq shashlik, Toshkent, kabob buyurtma",
      crumb: "Kaboblar",
    },
    ru: {
      title: "Доставка шашлыка в Ташкенте — Boyxon Oshxonasi",
      description:
        "Жиз-кабоб, кебаб из фарша и куриный шашлык. Горячая доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Шашлык — горячая доставка в Ташкенте",
      subtitle:
        "Жиз-кабоб, кебаб из фарша и куриный шашлык — на углях, свежеприготовленные.",
      content:
        "Шашлык — любимое блюдо вечернего стола. В Boyxon Oshxonasi готовят жиз-кабоб, кебаб из фарша и куриный шашлык на углях. Доставляем горячим, ароматным и сочным по всему Ташкенту.",
      keywords:
        "доставка шашлыка, жиз-кабоб, кебаб из фарша, куриный шашлык, Ташкент, заказать шашлык",
      crumb: "Шашлык",
    },
    en: {
      title: "Kebab delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Jiz kabob, minced meat kebab and chicken shashlik. Delivered hot across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Kebabs — hot delivery in Tashkent",
      subtitle: "Jiz kabob, minced meat kebab and chicken shashlik — grilled over charcoal.",
      content:
        "Kebab is the favourite dish of the evening table. Boyxon Oshxonasi grills jiz kabob, minced meat kebab and chicken shashlik over charcoal. Delivered hot, aromatic and juicy across Tashkent.",
      keywords:
        "kebab delivery, jiz kabob, minced meat kebab, chicken shashlik, Tashkent, order kebab",
      crumb: "Kebabs",
    },
  },
  salatlar: {
    uz: {
      title: "Salatlar yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Achchiq-chuchuk, Sezar salati va Olivye. Toshkent bo'ylab 30–45 daqiqada yetkazib berish, har kuni 9:00–23:00.",
      h1: "Salatlar — Toshkentda yangi va mazali",
      subtitle: "Achchiq-chuchuk, Sezar salati va Olivye — har kuni yangi tayyorlanadi.",
      content:
        "Salat — asosiy taomga yengil va foydali qo'shimcha. Boyxon Oshxonasida pomidor va piyozdan tayyorlangan achchiq-chuchuk, tovuqli Sezar salati va Olivye bor. Sabzavotlar har kuni yangilanadi, salatlar buyurtmadan keyin tayyorlanadi.",
      keywords:
        "salat yetkazib berish, achchiq-chuchuk, Sezar salati, Olivye, Toshkent, salat buyurtma",
      crumb: "Salatlar",
    },
    ru: {
      title: "Доставка салатов в Ташкенте — Boyxon Oshxonasi",
      description:
        "Ачичук, салат Цезарь и Оливье. Доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Салаты — свежие и вкусные в Ташкенте",
      subtitle: "Ачичук, салат Цезарь и Оливье — готовим каждый день.",
      content:
        "Салат — лёгкое и полезное дополнение к основному блюду. В Boyxon Oshxonasi есть ачичук из помидоров и лука, салат Цезарь с курицей и Оливье. Овощи обновляются ежедневно, салаты готовятся после заказа.",
      keywords: "доставка салатов, ачичук, салат Цезарь, Оливье, Ташкент, заказать салат",
      crumb: "Салаты",
    },
    en: {
      title: "Salad delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Achichuk, Caesar salad and Olivier. Delivered across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Salads — fresh and tasty in Tashkent",
      subtitle: "Achichuk, Caesar salad and Olivier — made fresh daily.",
      content:
        "Salad is a light and healthy addition to the main course. Boyxon Oshxonasi offers achichuk with tomato and onion, chicken Caesar salad and Olivier. Vegetables are refreshed daily and salads are made to order.",
      keywords: "salad delivery, achichuk, Caesar salad, Olivier, Tashkent, order salad",
      crumb: "Salads",
    },
  },
  shirinliklar: {
    uz: {
      title: "Shirinliklar yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Chak-chak, halva va quymoq — milliy shirinliklar. Toshkent bo'ylab 30–45 daqiqada yetkazib berish, har kuni 9:00–23:00.",
      h1: "Shirinliklar — Toshkentda milliy ta'm",
      subtitle: "Chak-chak, halva va quymoq — o'zbek dasturxonining shirin yakuni.",
      content:
        "O'zbek shirinliklari — choy dasturxonining bezagi. Boyxon Oshxonasida asal va yong'oqli chak-chak, an'anaviy halva va quymoq tayyorlanadi. Bayram va oilaviy dasturxon uchun Toshkent bo'ylab yetkazib beramiz.",
      keywords:
        "shirinlik yetkazib berish, chak-chak, halva, quymoq, Toshkent, milliy shirinliklar",
      crumb: "Shirinliklar",
    },
    ru: {
      title: "Доставка десертов в Ташкенте — Boyxon Oshxonasi",
      description:
        "Чак-чак, халва и куймак — национальные сладости. Доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Десерты — национальный вкус Ташкента",
      subtitle: "Чак-чак, халва и куймак — сладкое завершение узбекского стола.",
      content:
        "Узбекские сладости — украшение чайного стола. В Boyxon Oshxonasi готовят чак-чак с мёдом и орехами, традиционную халву и куймак. Доставляем по Ташкенту для праздников и семейного стола.",
      keywords:
        "доставка десертов, чак-чак, халва, куймак, Ташкент, национальные сладости",
      crumb: "Десерты",
    },
    en: {
      title: "Dessert delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Chak-chak, halva and quymoq — Uzbek national sweets. Delivered across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Desserts — Uzbek flavours in Tashkent",
      subtitle: "Chak-chak, halva and quymoq — the sweet finish to an Uzbek meal.",
      content:
        "Uzbek sweets are the centrepiece of the tea table. Boyxon Oshxonasi prepares chak-chak with honey and nuts, traditional halva and quymoq. Delivered across Tashkent for holidays and family gatherings.",
      keywords: "dessert delivery, chak-chak, halva, quymoq, Tashkent, Uzbek sweets",
      crumb: "Desserts",
    },
  },
  ichimliklar: {
    uz: {
      title: "Ichimliklar yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Choy, ayron va kompot — taomga mos ichimliklar. Toshkent bo'ylab 30–45 daqiqada yetkazib berish, har kuni 9:00–23:00.",
      h1: "Ichimliklar — Toshkentda salqin va tetiklantiruvchi",
      subtitle: "Choy, ayron va kompot — taomga mos tanlov.",
      content:
        "Ichimlik taomning ta'mini to'ldiradi. Boyxon Oshxonasida choy (choynak), uy ayroni va mevali kompot bor. Issiq taomlar bilan birga buyurtma qiling — Toshkent bo'ylab yetkazib beramiz.",
      keywords: "ichimlik yetkazib berish, choy, ayron, kompot, Toshkent, sovuq ichimlik",
      crumb: "Ichimliklar",
    },
    ru: {
      title: "Доставка напитков в Ташкенте — Boyxon Oshxonasi",
      description:
        "Чай, айран и компот — напитки к любому блюду. Доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Напитки — прохладные и освежающие в Ташкенте",
      subtitle: "Чай, айран и компот — идеальное дополнение к любому блюду.",
      content:
        "Напиток дополняет вкус блюда. В Boyxon Oshxonasi есть чай (чайник), домашний айран и фруктовый компот. Закажите вместе с горячими блюдами — доставим по Ташкенту.",
      keywords: "доставка напитков, чай, айран, компот, Ташкент, напитки",
      crumb: "Напитки",
    },
    en: {
      title: "Drinks delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Tea, ayran and kompot — drinks for every dish. Delivered across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Drinks — cool and refreshing in Tashkent",
      subtitle: "Tea, ayran and kompot — the perfect match for any dish.",
      content:
        "A drink completes the flavour of a meal. Boyxon Oshxonasi offers tea (teapot), homemade ayran and fruit kompot. Order them with your hot dishes and we will deliver across Tashkent.",
      keywords: "drinks delivery, tea, ayran, kompot, Tashkent, drinks",
      crumb: "Drinks",
    },
  },
  non: {
    uz: {
      title: "Non yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Patir, yupqa va gijda non. Toshkent bo'ylab 30–45 daqiqada issiq yetkazib berish, har kuni 9:00–23:00.",
      h1: "Non — Toshkentda tandirdan issiq yetkazib berish",
      subtitle: "Patir, yupqa va gijda non — har kuni yangi pishirilgan.",
      content:
        "Non — o'zbek dasturxonining asosi. Boyxon Oshxonasida patir, yupqa va gijda non bor. Nonni palov, kabob yoki sho'rva bilan birga buyurtma qiling; issiq holda Toshkent bo'ylab yetkazib beramiz.",
      keywords: "non yetkazib berish, patir non, yupqa non, gijda non, Toshkent, issiq non",
      crumb: "Non",
    },
    ru: {
      title: "Доставка хлеба в Ташкенте — Boyxon Oshxonasi",
      description:
        "Патир, юпка и гижда — свежий узбекский хлеб. Горячая доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Хлеб — горячая доставка из тандыра в Ташкенте",
      subtitle: "Патир, юпка и гижда — свежеиспечённые каждый день.",
      content:
        "Хлеб — основа узбекского стола. В Boyxon Oshxonasi есть патир, юпка и гижда. Закажите хлеб вместе с пловом, шашлыком или супом; доставим горячим по Ташкенту.",
      keywords: "доставка хлеба, патир, юпка, гижда, Ташкент, свежий хлеб",
      crumb: "Хлеб",
    },
    en: {
      title: "Bread delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Patir, yupqa and gijda — fresh Uzbek bread. Delivered hot across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Bread — hot tandoor delivery in Tashkent",
      subtitle: "Patir, yupqa and gijda — baked fresh every day.",
      content:
        "Bread is the foundation of the Uzbek table. Boyxon Oshxonasi offers patir, yupqa and gijda bread. Order bread with pilaf, kebab or soup and we will deliver it hot across Tashkent.",
      keywords: "bread delivery, patir, yupqa, gijda, Tashkent, fresh bread",
      crumb: "Bread",
    },
  },
  // Production bazadagi umumiy kategoriya (barcha taomlar shu yerda).
  // Boshqa kategoriyalar qo'shilsa, yuqoridagi maxsus matnlar ishlatiladi.
  taomlar: {
    uz: {
      title: "Ovqatlar yetkazib berish Toshkentda — Boyxon Oshxonasi",
      description:
        "Boyxon Oshxonasining mazali taomlari — yangi va issiq. Toshkent bo'ylab 30–45 daqiqada yetkazib berish, har kuni 9:00–23:00.",
      h1: "Ovqatlar — Toshkentda issiq yetkazib berish",
      subtitle:
        "Boyxon Oshxonasining barcha taomlari — buyurtmadan so'ng tayyorlanadi va issiq holda yetkaziladi.",
      content:
        "Ovqatlar bo'limida Boyxon Oshxonasining mazali taomlari jamlangan. Har bir taom buyurtmadan so'ng tayyorlanadi va Toshkent bo'ylab 30–45 daqiqada issiq holda yetkaziladi. Tarkib va narxni taom sahifasida ko'rish mumkin.",
      keywords:
        "ovqatlar yetkazib berish, taomlar, Boyxon Oshxonasi, Toshkent, issiq taom buyurtma",
      crumb: "Ovqatlar",
    },
    ru: {
      title: "Доставка блюд в Ташкенте — Boyxon Oshxonasi",
      description:
        "Вкусные блюда Boyxon Oshxonasi — свежие и горячие. Доставка по Ташкенту за 30–45 минут, ежедневно с 9:00 до 23:00.",
      h1: "Блюда — горячая доставка в Ташкенте",
      subtitle:
        "Все блюда Boyxon Oshxonasi — готовим после заказа и доставляем горячими.",
      content:
        "В разделе блюд собраны вкусные блюда Boyxon Oshxonasi. Каждое блюдо готовится после заказа и доставляется горячим по Ташкенту за 30–45 минут. Состав и цены смотрите на странице блюда.",
      keywords:
        "доставка блюд, еда, Boyxon Oshxonasi, Ташкент, заказать еду",
      crumb: "Блюда",
    },
    en: {
      title: "Food delivery in Tashkent — Boyxon Oshxonasi",
      description:
        "Delicious dishes from Boyxon Oshxonasi — fresh and hot. Delivered across Tashkent in 30–45 minutes, daily 9:00–23:00.",
      h1: "Dishes — hot delivery in Tashkent",
      subtitle:
        "All Boyxon Oshxonasi dishes — cooked after ordering and delivered hot.",
      content:
        "The dishes section brings together the delicious food of Boyxon Oshxonasi. Each dish is prepared after ordering and delivered hot across Tashkent within 30–45 minutes. See the dish page for ingredients and prices.",
      keywords: "food delivery, dishes, Boyxon Oshxonasi, Tashkent, order food",
      crumb: "Dishes",
    },
  },
};

export function getCategorySeo(slug: string, lang: SeoLang): CategorySeoCopy | undefined {
  return CATEGORY_SEO[slug]?.[lang];
}
