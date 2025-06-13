"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export function FavoriteButton({ productId }: { productId: string }) {
  const { user } = useKindeBrowserClient();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      const checkFavorite = async () => {
        const res = await fetch("/api/favorites");
        const favorites = await res.json();
        setIsFavorite(favorites.some((fav: any) => fav.productId === productId));
      };
      checkFavorite();
    }
  }, [user, productId]);

  const handleFavorite = async () => {
    if (!user) {
      // Handle unauthenticated user
      return;
    }

    const res = await fetch("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ productId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 z-10"
      onClick={handleFavorite}
    >
      <Heart className={isFavorite ? "fill-red-500" : ""} />
    </Button>
  );
}