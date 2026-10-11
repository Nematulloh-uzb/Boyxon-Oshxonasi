import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

/** 404 — sahifa topilmadi. */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 px-6 text-center">
      <ChefHat className="h-16 w-16 text-primary-500" />
      <h1 className="font-display text-4xl font-bold text-ink-900">404</h1>
      <p className="text-ink-500">Bu sahifa topilmadi. Balki menyuga qaytamiz?</p>
      <Link
        to="/"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-500 px-6 text-[15px] font-semibold text-white transition hover:bg-primary-600 active:scale-[0.98]"
      >
        Bosh sahifaga
      </Link>
    </div>
  );
}

