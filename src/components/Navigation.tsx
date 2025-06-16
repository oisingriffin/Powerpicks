'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Power Picks Logo"
            width={200}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
        <div className="space-x-6">
          <Link href="/raffles" className="text-gray-700 hover:text-primary transition-colors">Raffles</Link>
          <Link href="/winners" className="text-gray-700 hover:text-primary transition-colors">Winners</Link>
        </div>
        <Link 
          href="/admin/login" 
          className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors"
        >
          Sign In
        </Link>
      </nav>
    </header>
  );
} 