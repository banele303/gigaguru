"use client";

import { Button } from "@/components/ui/button";
import { Product } from "@/app/lib/zodSchemas";
import { ShoppingCart } from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user } = useKindeBrowserClient();

  const handleAddToCart = () => {
    if (!user) {
      toast.error("You must be logged in to add items to your cart.");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingProduct = cart.find((p: Product) => p.id === product.id);

    if (existingProduct) {
      toast.info("This product is already in your cart.");
    } else {
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success("Added to cart");
    }
  };

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