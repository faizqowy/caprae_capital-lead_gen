
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { LeadsProvider } from '@/hooks/useLeads';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'LeadGenius',
  description: 'AI-powered lead generation and enrichment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <LeadsProvider>
            {children}
          </LeadsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
