import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/useAuth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  text?: 'signin_with' | 'signup_with';
}

export function GoogleSignInButton({ onSuccess, onError, text = 'signin_with' }: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);   // add this guard

  useEffect(() => {
    if (hasInitialized.current) return;   // add this early-return

    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set.');
      return;
    }

    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | undefined;

    const renderButton = () => {
      if (cancelled || !window.google || !buttonRef.current) return;
      hasInitialized.current = true;      // add this, right before initializing

      const width = Math.min(320, containerRef.current?.offsetWidth ?? 320);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            await googleLogin(response.credential);
            onSuccess?.();
          } catch (err) {
            const message =
              err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Google sign-in failed. Please try again.';
            onError?.(message);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        width,
      });
    };

    if (window.google) {
      renderButton();
    } else {
      pollId = setInterval(() => {
        if (window.google) {
          if (pollId) clearInterval(pollId);
          renderButton();
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
    };
  }, [googleLogin, onSuccess, onError, text]);

  return (
    <div ref={containerRef} className="flex w-full justify-center">
    <div ref={buttonRef} />
    </div>
  );
}
