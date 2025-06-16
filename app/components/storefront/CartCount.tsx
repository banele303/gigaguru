'use client';

import { useCart } from '@/app/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartCount() {
  const { cartItemCount } = useCart();

  return (
    <Link href="/bag" className="relative">
      <ShoppingBag className="h-6 w-6" />
      {cartItemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartItemCount}
        </span>
      )}
    </Link>
  );
} 