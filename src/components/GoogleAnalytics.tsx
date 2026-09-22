import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

/**
 * Envía pageviews a GA4 en cada navegación del router.
 * El script base de gtag se inyecta en el <head> desde __root.tsx.
 */
export function GaPageTracker({ gaId }: { gaId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!gaId) return;
    const unsubscribe = router.subscribe('onResolved', (event) => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', gaId, {
          page_path: event.toLocation.pathname + event.toLocation.search,
        });
      }
    });
    return unsubscribe;
  }, [router, gaId]);

  return null;
}
