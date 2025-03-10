import { useAuth0 } from '@auth0/auth0-react';
import { Layout } from './components/layout/Layout';
import { ChatInterface } from './components/chat/ChatInterface';
import { ThemeProvider } from './components/theme-provider';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="kerdos-theme">
      <Layout>
        {isAuthenticated ? (
          <ChatInterface />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <h2 className="text-2xl font-bold">Welcome to Kerdos AI Chat</h2>
            <p className="text-muted-foreground">Please log in to start chatting.</p>
          </div>
        )}
      </Layout>
    </ThemeProvider>
  );
}

export default App;
