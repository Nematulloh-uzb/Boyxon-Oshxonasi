import type { Dish } from '../api/types';

/** Kategoriya slug'i → Material ikonka (dizayn: restaurant / soup_kitchen / bakery_dining / kebab_dining / cake). */
const BY_SLUG: Record<string, string> = {
  shorvalar: 'soup_kitchen',
  "sho'rvalar": 'soup_kitchen',
  suplar: 'soup_kitchen',
  palovlar: 'rice_bowl',
  palov: 'rice_bowl',
  somsa: 'bakery_dining',
  somsalar: 'bakery_dining',
  kaboblar: 'kebab_dining',
  kabob: 'kebab_dining',
  salatlar: 'restaurant',
  salat: 'restaurant',
  shirinliklar: 'cake',
  desertlar: 'cake',
  ichimliklar: 'local_drink',
  ichimlik: 'local_drink',
  non: 'bakery_dining',
  nonlar: 'bakery_dining',
};

export function dishIconFor(dish: Pick<Dish, 'category'>): string {
  const cat = dish.category;
  if (cat && typeof cat === 'object' && 'slug' in cat && typeof cat.slug === 'string') {
    return BY_SLUG[cat.slug.toLowerCase()] ?? 'restaurant';
  }
  return 'restaurant';
}
