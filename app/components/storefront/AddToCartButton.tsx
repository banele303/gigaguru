"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { addItem } from "@/app/actions";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user } = useKindeBrowserClient();

  const handleAddToCart = async () => {
    try {
      const result = await addItem(product.id);
      if (result?.success) {
        toast.success("Added to cart");
      } else {
        toast.error(result?.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Button
      size="icon"
      variant="outline"
      className="hover:bg-primary hover:text-white group relative"
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {!user && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Sign in to add to cart
        </span>
      )}
    </Button>
  );
}