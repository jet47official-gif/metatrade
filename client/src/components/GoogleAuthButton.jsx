import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export default function GoogleAuthButton({
  text = 'Sign in with Google',
  redirectTo = '/dashboard',
}) {
  const scriptLoadedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '';

  useEffect(() => {
    if (!clientId || scriptLoadedRef.current) return;

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
          });
          const btnContainer = document.getElementById('google-signin-button');
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              width: '320',
              shape: 'rectangular',
            });
          }
        }
      } catch (err) {
        console.error('Google init error:', err);
      }
    };
    script.onerror = (err) => {
      console.error('Failed to load Google script', err);
    };
    document.head.appendChild(script);

    return () => {
      // keep script
    };
  }, [clientId]);

  async function handleCredentialResponse(response) {
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/google', {
        credential: response.credential,
      });
      const { token, user } = res.data || {};
      if (token && user) {
        authLogin({ token, user });
        navigate(redirectTo, { replace: true });
      } else {
        setError('Google sign-in failed');
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  if (!clientId) {
    return (
      <div className="text-center text-xs text-gray-400 mt-2">
        Google sign-in not configured
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div id="google-signin-button" className="mt-2"></div>
      {(loading || error) && (
        <p className="text-xs mt-2 text-gray-300">{loading ? 'Signing in...' : error}</p>
      )}
    </div>
  );
}
