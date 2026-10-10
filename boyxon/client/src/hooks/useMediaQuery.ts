import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const fn = (e: MediaQueryListEvent): void => setMatches(e.matches);
    m.addEventListener('change', fn);
    setMatches(m.matches);
    return () => m.removeEventListener('change', fn);
  }, [query]);
  return matches;
}
