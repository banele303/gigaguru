import { useAnalytics } from "@/app/hooks/useAnalytics";
import { useCart } from "@/app/hooks/useCart";
import { useEffect } from "react";

export default function Cart() {
  const { trackCartAbandonment } = useAnalytics();
  const { items, total } = useCart();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (items.length > 0) {
        trackCartAbandonment({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [items, total, trackCartAbandonment]);

  return null; // This component is used for tracking cart abandonment only
} 