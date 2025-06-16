"use client";

import { Product } from "@/app/lib/zodSchemas";
import { AddToCartButton } from "./AddToCartButton";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "./FavoriteButton";
import { formatPrice } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardClientProps {
  item: Product;
}

export function ProductCardClient({ item }: ProductCardClientProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (item.isSale && item.saleEndDate) {
      const calculateTimeLeft = () => {
        const difference = new Date(item.saleEndDate!).getTime() - new Date().getTime();
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${days > 0 ? `${days}d ` : ""}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
        } else {
          setTimeLeft("Sale Ended");
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [item.isSale, item.saleEndDate]);

  const originalPrice = item.price;
  const discountedPrice = item.discountPrice;

  // Explicitly ensure discountedPrice is a number for type safety
  const numericDiscountPrice = typeof discountedPrice === 'number' ? discountedPrice : undefined;

  const isCurrentlyOnSale = item.isSale && numericDiscountPrice != null && numericDiscountPrice < originalPrice && timeLeft !== "Sale Ended";

  const percentageOff = isCurrentlyOnSale
    ? Math.round(((originalPrice - numericDiscountPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="group rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <Carousel className="w-full mx-auto">
          <CarouselContent>
            {item.images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[280px]">
                  <Image
                    src={img}
                    alt={item.name}
                    fill
                    className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  {isCurrentlyOnSale && (
                    <>
                      <Badge variant="destructive" className="absolute top-2 left-2 text-white">
                        -{percentageOff}%
                      </Badge>
                      {timeLeft && timeLeft !== "Sale Ended" && (
                        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-timer"
                          >
                            <path d="M10 2h4" />
                            <path d="M12 14v4" />
                            <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
                          </svg>
                          <span>{timeLeft}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <CarouselPrevious className="static translate-x-0 translate-y-0 bg-black/80 hover:bg-black text-white" />
                    <CarouselNext className="static translate-x-0 translate-y-0 bg-black/80 hover:bg-black text-white" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {item.id && <FavoriteButton productId={item.id} />}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
        <div className="flex items-baseline gap-2 mt-2">
          {isCurrentlyOnSale ? (
            <>
              <p className="text-primary font-bold text-xl">{formatPrice(numericDiscountPrice!)}</p>
              <p className="text-muted-foreground line-through text-sm">{formatPrice(originalPrice)}</p>
            </>
          ) : (
            <p className="text-primary font-bold text-xl">{formatPrice(originalPrice)}</p>
          )}
        </div>
        <div className="flex gap-x-2 mt-4">
          {item.id && <AddToCartButton product={{
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.images
          }} />}
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200"
          >
            <Link href={`/product/${item.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
