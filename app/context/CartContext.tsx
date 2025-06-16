'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart } from '@/app/actions';
import type { Cart, CartItem } from '@/app/lib/interfaces';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = async () => {
    try {
      const updatedCart = await getCart();
      setCart(updatedCart);
      setItemCount(updatedCart?.items.length || 0);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 