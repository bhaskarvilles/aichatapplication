import { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../ui/button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Kerdos AI Chat</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    logout({ logoutParams: { returnTo: window.location.origin } })
                  }
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => loginWithRedirect()}>Login</Button>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
} 