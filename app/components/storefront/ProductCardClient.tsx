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

interface ProductCardClientProps {
  item: Product;
}

export function ProductCardClient({ item }: ProductCardClientProps) {
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
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <CarouselPrevious className="static translate-x-0 translate-y-0 bg-white/80 hover:bg-white" />
                    <CarouselNext className="static translate-x-0 translate-y-0 bg-white/80 hover:bg-white" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <FavoriteButton productId={item.id} />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
        <p className="text-primary font-bold text-xl mt-2">{formatPrice(item.price)}</p>
        <div className="flex gap-x-2 mt-4">
          <AddToCartButton product={item} />
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
