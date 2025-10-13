'use client';

import { WalletButton } from '@/components/WalletButton';
import { useAdmin } from '@/lib/useAdmin';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === '/') {
      // If already on home page, force a refresh
      window.location.href = '/';
    } else {
      // Navigate normally
      router.push('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 py-3 max-w-screen-xl mx-auto">
        {/* Left: Logo/Brand */}
        <a 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span className="text-2xl">🐛</span>
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            BugDex
          </span>
        </a>

        {/* Right: Admin Link + Wallet Button */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </Link>
          )}
          <WalletButton variant="compact" />
        </div>
      </div>
    </header>
  );
}
