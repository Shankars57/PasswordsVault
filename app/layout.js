import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { VaultProvider } from '@/contexts/VaultContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SecureVault - Password Manager',
  description: 'Secure password manager with client-side encryption',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <VaultProvider>
              {children}
              <Toaster />
            </VaultProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
