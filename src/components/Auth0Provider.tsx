'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';

export function Auth0ProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'kerdos.us.auth0.com';
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'epVtYDnsu25qv73N67doIz3IxxQSak1b';
  
  // Ensure we're using the correct callback URL
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/callback`
    : '';

  const onRedirectCallback = (appState: any) => {
    // Handle callback redirect
    router.push(appState?.returnTo || '/');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: 'https://api.aichat.app',
        scope: 'openid profile email'
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
} 