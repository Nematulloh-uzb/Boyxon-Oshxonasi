import { useEffect, useRef, useState } from 'react';
import { Loader2, LocateFixed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/** Xaritada tanlangan nuqta. */
export interface MapPick {
  lat: number;
  lng: number;
}

/** Toshkent markazi — xarita standart ochiladigan nuqta. */
export const TASHKENT_CENTER: [number, number] = [41.3111, 69.2797];

/** Leaflet'ni faqat xarita kerak bo'lganda dynamically yuklaymiz (unused-JS kamaytirish uchun). */
async function loadLeaflet(): Promise<typeof import('leaflet')> {
  const L = await import('leaflet');
  await import('leaflet/dist/leaflet.css');
  return L;
}

/**
 * Nominatim (OpenStreetMap) orqali teskari geokodlash — API kalitsiz.
 * Manzilni "shahar, tuman, ko'cha" ko'rinishida qaytaradi.
 */
async function reverseGeocode(lat: number, lng: number, lang: string): Promise<string | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('zoom', '18');
    url.searchParams.set('accept-language', `${lang},en`);
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string; address?: Record<string, string> };
    const a = data.address ?? {};
    const road = [a.road ?? a.pedestrian ?? a.footway, a.house_number].filter(Boolean).join(' ');
    const parts = [
      a.city ?? a.town ?? a.village ?? a.county,
      a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district,
      road,
    ].filter((p): p is string => Boolean(p && p.trim()));
    if (parts.length) return parts.join(', ');
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

interface MapPickerProps {
  /** Joriy tanlangan nuqta (bo'lsa xarita markazi shunga qo'yiladi). */
  value?: MapPick | null;
  /** Nuqta tanlanganda chaqiriladi: koordinata + avtomatik topilgan manzil matni. */
  onPick: (pick: MapPick, addressText: string | null) => void;
  /** Xarita balandligi (px). Standart 220. */
  height?: number;
  className?: string;
}

/**
 * Manzilni xaritadan tanlash (OSM + Nominatim, kalitsiz).
 * Pin surganda yoki xarita bosilganda manzil matni avtomatik to'ldiriladi.
 */
export function MapPicker({ value, onPick, height = 220, className }: MapPickerProps) {
  const { t, i18n } = useTranslation();
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const langRef = useRef(i18n.language);
  langRef.current = i18n.language;
  const [busy, setBusy] = useState(false);
  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null);

  // Leaflet'ni dinamik yuklash — shunchaki xarita ochilganda (Settings → Manzillarim → Qo'shish)
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (!cancelled) setLeaflet(L);
      })
      .catch(() => {
        // Leaflet yuklanmasa xarita qsiyramaydi — foydalanuvchi qo'shiga ko'rinaishi mumkin
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Markerni joylashtirib, teskari geokodlashni (debounce bilan) boshlaydi. */
  const setPoint = (lat: number, lng: number, fly = false): void => {
    const L = leaflet;
    if (!L || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    if (fly) mapRef.current.flyTo([lat, lng], 16, { duration: 0.6 });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setBusy(true);
    timerRef.current = window.setTimeout(() => {
      void reverseGeocode(lat, lng, langRef.current).then((text) => {
        setBusy(false);
        pickRef.current({ lat, lng }, text);
      });
    }, 450);
  };

  /** "Mening joylashuvim" — brauzer geolokatsiyasi. */
  const locateMe = (): void => {
    if (!navigator.geolocation) {
      toast.error(t('map.geo_error'));
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setPoint(pos.coords.latitude, pos.coords.longitude, true),
      () => {
        setBusy(false);
        toast.error(t('map.geo_denied'));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const L = leaflet;
    const el = divRef.current;
    if (!L || !el || mapRef.current) return;
    const start: [number, number] = value ? [value.lat, value.lng] : TASHKENT_CENTER;
    const map = L.map(el, {
      center: start,
      zoom: value ? 16 : 13,
      attributionControl: true,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const pinIcon = L.divIcon({
      className: 'bx-map-pin',
      html:
        '<svg width="36" height="36" viewBox="0 0 24 24" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,.35))">' +
        '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#E67E22"/>' +
        '<circle cx="12" cy="9" r="2.6" fill="#fff"/></svg>',
      iconSize: [36, 36],
      iconAnchor: [18, 34],
    });
    const marker = L.marker(start, { icon: pinIcon, draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      setPoint(p.lat, p.lng);
    });
    map.on('click', (e: any) => setPoint(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    markerRef.current = marker;
    // Mount bo'lgach o'lchamni qayta hisoblash (layout kechikishlariga chidamli).
    window.setTimeout(() => map.invalidateSize(), 120);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaflet, value]);

  if (!leaflet) {
    // Hajr qoldirilgan joy — xarita yuklanmaganda o'rnini saqlaydi (CLS oldini olish)
    return (
      <div className={className}>
        <div className="relative overflow-hidden rounded-xl border border-ink-line">
          <div ref={divRef} style={{ height }} className="z-0 w-full bg-surface-raised" />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-300">{t('map.pick_hint')}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl border border-ink-line">
        <div ref={divRef} style={{ height }} className="z-0 w-full" />
        <button
          type="button"
          onClick={locateMe}
          title={t('map.my_location')}
          aria-label={t('map.my_location')}
          className="absolute bottom-3 right-3 z-[500] grid h-9 w-9 place-items-center rounded-lg bg-surface text-fg-muted shadow-md hover:bg-surface-raised"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-ink-300">{t('map.pick_hint')}</p>
    </div>
  );
}
