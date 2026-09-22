import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

/**
 * Botón oficial de Google Identity Services.
 * En el callback se envía el ID token a /api/auth/google, que lo verifica
 * (firma + audiencia) y crea la cookie de sesión.
 */
export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId || !containerRef.current) return;

    const handleCredential = async (response: { credential: string }) => {
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });
        if (!res.ok) throw new Error('Auth failed');
        await refresh();
      } catch {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    };

    const init = () => {
      if (!containerRef.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (r) => void handleCredential(r),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        locale: 'es',
      });
    };

    if (window.google?.accounts) {
      init();
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [clientId, refresh]);

  if (!clientId) {
    return (
      <p className="text-xs text-gray-500">
        Login no configurado (falta VITE_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div>
      <div ref={containerRef} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
