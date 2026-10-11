import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-ink-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-ink-300 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-ink-700">Boyxon Oshxonasi</p>
          <p className="mt-1">Milliy taomlar — tez va issiq yetkazib berish.</p>
        </div>
        <div>
          <p className="font-semibold text-ink-700">Navigatsiya</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/" className="hover:text-primary-600">Menyu</Link>
            <Link to="/cart" className="hover:text-primary-600">Savatcha</Link>
            <Link to="/settings" className="hover:text-primary-600">Sozlamalar</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-ink-700">Aloqa</p>
          <p className="mt-2">+998 71 200 00 00</p>
          <p>Toshkent, Yunusobod — 9:00–23:00</p>
        </div>
      </div>
    </footer>
  );
}
