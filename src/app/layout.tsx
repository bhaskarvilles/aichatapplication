import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Auth0ProviderWithNavigate } from '@/components/Auth0Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat App',
  description: 'Chat with an AI assistant powered by Cloudflare Workers AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Auth0ProviderWithNavigate>
            {children}
          </Auth0ProviderWithNavigate>
        </ThemeProvider>
      </body>
    </html>
  );
} 