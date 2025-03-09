import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderConfigProps {
  children: ReactNode;
}

export function Auth0ProviderConfig({ children }: Auth0ProviderConfigProps) {
  const domain = 'kerdos.us.auth0.com';
  const clientId = 'epVtYDnsu25qv73N67doIz3IxxQSak1b';
  const audience = 'https://ai-chat-backend-ujxv.onrender.com';

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
} 