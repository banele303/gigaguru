"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
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
    if (!user) {
      toast.error("You must be logged in to add items to your cart.");
      return;
    }

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

  if (!user) {
    return (
      <Button
        size="icon"
        variant="outline"
        className="hover:bg-primary hover:text-white"
        asChild
      >
        <LoginLink>Sign in to add to cart</LoginLink>
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className="hover:bg-primary hover:text-white"
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-5 w-5" />
    </Button>
  );
}