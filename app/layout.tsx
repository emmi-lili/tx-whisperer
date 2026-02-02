import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tx Whisperer - Transaction Hash Detector',
  description: 'Detect blockchain networks from transaction hashes. Supports EVM, Solana, and Bitcoin.',
  keywords: ['transaction', 'blockchain', 'ethereum', 'solana', 'bitcoin', 'hash', 'detector'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen antialiased`}>
        {/* Background gradient effect */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
