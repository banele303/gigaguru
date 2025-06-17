"use client";

import { useState, useEffect } from 'react';
import { ShoppingBagIcon } from 'lucide-react';
import { useCart } from '@/app/context/CartContext';
import { CartDropdown } from './CartDropdown';

export function CartIcon() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <button 
        onClick={() => setShowDropdown(true)} 
        className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <ShoppingBagIcon className="h-5 w-5 text-gray-700" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
            {itemCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <CartDropdown onClose={() => setShowDropdown(false)} />
      )}
    </>
  );
} 