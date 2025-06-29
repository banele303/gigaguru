"use client"

import type { Product } from "@/app/lib/zodSchemas"
import { AddToCartButton } from "./AddToCartButton"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import Link from "next/link"
import { FavoriteButton } from "./FavoriteButton"
import { formatPrice } from "@/app/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Clock, Eye, Zap, TrendingUp, ShoppingBag, Sparkles } from "lucide-react"

interface ProductCardClientProps {
  item: Product
}

export function ProductCardClient({ item }: ProductCardClientProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (item.isSale && item.saleEndDate) {
      const calculateTimeLeft = () => {
        const difference = new Date(item.saleEndDate!).getTime() - new Date().getTime()
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          setTimeLeft(
            `${days > 0 ? `${days}d ` : ""}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          )
        } else {
          setTimeLeft("Sale Ended")
        }
      }

      calculateTimeLeft()
      const timer = setInterval(calculateTimeLeft, 1000)
      return () => clearInterval(timer)
    }
  }, [item.isSale, item.saleEndDate])

  const originalPrice = item.price
  const discountedPrice = item.discountPrice

  // Explicitly ensure discountedPrice is a number for type safety
  const numericDiscountPrice = typeof discountedPrice === "number" ? discountedPrice : undefined

  const isCurrentlyOnSale =
    item.isSale && numericDiscountPrice != null && numericDiscountPrice < originalPrice && timeLeft !== "Sale Ended"

  const percentageOff = isCurrentlyOnSale
    ? Math.round(((originalPrice - numericDiscountPrice) / originalPrice) * 100)
    : 0

  return (
    <div
      className="group relative rounded-xl bg-gradient-to-br from-white to-gray-50/50 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100/50 backdrop-blur-sm max-w-md mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-xl">
        <Carousel className="w-full mx-auto">
          <CarouselContent>
            {item.images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[220px] sm:h-[280px] w-full overflow-hidden">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                    priority
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Sale Badge */}
                  {isCurrentlyOnSale && (
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      <Badge
                        variant="destructive"
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />-{percentageOff}% OFF
                      </Badge>

                      {/* Hot Deal Badge */}
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-2 py-0.5 rounded-full text-xs">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        HOT DEAL
                      </Badge>
                    </div>
                  )}

                  {/* Sale Timer - Modern Cool Colors */}
                  {timeLeft && timeLeft !== "Sale Ended" && isCurrentlyOnSale && (
                    <div className="absolute bottom-2 left-2 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 backdrop-blur-md text-white text-xs sm:text-sm px-2.5 py-1.5 rounded-full flex items-center gap-1.5 border border-cyan-300/30 shadow-lg">
                      <Clock className="w-3 h-3 text-cyan-200 animate-pulse" />
                      <span className="font-mono font-semibold tracking-wide">{timeLeft}</span>
                    </div>
                  )}

                  

                  {/* Carousel Navigation */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CarouselPrevious className="static translate-x-0 translate-y-0 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 rounded-full w-8 h-8" />
                    <CarouselNext className="static translate-x-0 translate-y-0 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 rounded-full w-8 h-8" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Favorite Button */}
        {item.id && (
          <div className="absolute top-2 right-2">
            <FavoriteButton productId={item.id} />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative p-4 space-y-3">
        {/* Product Name */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {item.name}
          </h3>
        </div>

        {/* Pricing Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {isCurrentlyOnSale ? (
              <>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(numericDiscountPrice!)}
                </p>
                <p className="text-gray-400 line-through text-base font-medium">{formatPrice(originalPrice)}</p>
              </>
            ) : (
              <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>

          {/* Trending Badge */}
          {isCurrentlyOnSale && (
            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
              <TrendingUp className="w-2.5 h-2.5 mr-1" />
              Trending
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {item.id && (
            <div className="flex-1">
              <AddToCartButton
                product={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  images: item.images,
                }}
              />
            </div>
          )}

          <Button
            asChild
            variant="outline"
            className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200 text-gray-700 hover:text-gray-900 font-semibold rounded-lg transition-all duration-300 hover:shadow-md group/btn text-sm"
          >
            <Link href={`/product/${item.id}`} className="flex items-center justify-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform duration-200" />
              View Details
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Free Shipping</span>
          <span className="text-xs text-green-600 font-semibold">In Stock</span>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}
