import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

const GoogleAnalytics = () => {
  const router = useRouter();

  useEffect(() => {
    // Don't run if there's no GA ID
    if (!GA_TRACKING_ID) return;

    // --- Ping functionality ---
    const sendPing = () => {
      // Send to Google Analytics if gtag is available
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'user_ping', { alive: true });
      }
      // Send to our backend API
      // Use keepalive to ensure the request is sent even if the user navigates away
      navigator.sendBeacon('/api/ping');
    };

    // Send a ping immediately on load and then every 20 seconds
    sendPing();
    const interval = setInterval(sendPing, 20000);

    // --- Page change tracking ---
    const handleRouteChange = (url: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // --- Cleanup ---
    return () => {
      clearInterval(interval);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
