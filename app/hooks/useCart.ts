import { useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Cart } from '@/app/lib/interfaces';

export function useCart() {
  const { user } = useKindeBrowserClient();
  const [items, setItems] = useState<Cart['items']>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/cart?userId=${user.id}`);
        const data = await response.json();
        
        if (data.cart) {
          setItems(data.cart.items || []);
          setTotal(data.cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, [user]);

  return { items, total };
} 