import { useEffect, useState } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Cart } from '@/app/lib/interfaces';
import { getCart } from '@/app/actions';

export function useCart() {
  const { user } = useKindeBrowserClient();
  const [items, setItems] = useState<Cart['items']>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;

      try {
        const cart = await getCart();
        if (cart) {
          setItems(cart.items || []);
          setTotal(cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCart();
  }, [user]);

  return { items, total };
} 