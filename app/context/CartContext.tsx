'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart } from '@/app/actions';
import type { Cart, CartItem } from '@/app/lib/interfaces';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  const refreshCart = async () => {
    try {
      const updatedCart = await getCart();
      setCart(updatedCart);
      const cartItems = updatedCart?.items || [];
      setItems(cartItems);
      setItemCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
      setTotal(cartItems.reduce((acc, item) => acc + (item.discountPrice ?? item.price) * item.quantity, 0));
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, items, itemCount, total, refreshCart }}>
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