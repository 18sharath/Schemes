import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const GoogleSignInButton = ({ onSuccessNavigate }) => {
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const { googleLogin } = useAuth();

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Load Google Identity Services script if not present
    const ensureScript = () =>
      new Promise((resolve, reject) => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          return resolve();
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    if (!clientId) {
      console.error('Missing REACT_APP_GOOGLE_CLIENT_ID');
      return;
    }

    ensureScript()
      .then(() => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const idToken = response.credential;
              const result = await googleLogin(idToken);
              if (result.success) {
                toast.success('Signed in with Google');
                onSuccessNavigate?.();
              } else {
                toast.error(result.message || 'Google sign-in failed');
              }
            } catch (err) {
              toast.error('Google sign-in failed');
            }
          },
        });
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            width: 320,
          });
          setReady(true);
        }
      })
      .catch(() => {
        console.error('Failed to load Google script');
      });
  }, [clientId, googleLogin]);

  return (
    <div>
      <div ref={buttonRef} />
      {!clientId && (
        <p className="text-sm text-red-600 mt-2">Google Sign-In not configured.</p>
      )}
      {clientId && !ready && (
        <p className="text-sm text-gray-500 mt-2">Loading Google Sign-In…</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;


