import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Play, ShoppingCart, Heart, Share2 } from "lucide-react"
import Link from "next/link"

export interface BannerData {
  id: string
  title: string
  imageString: string
}

export function Hero({ data }: { data: BannerData[] }) {
  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {data.map((item: BannerData) => (
            <CarouselItem key={item.id}>
              <div className="relative h-[60vh] lg:h-[85vh] overflow-hidden rounded-2xl group">
                {/* Background Image with Overlay */}
                <Image
                  alt="Banner Image"
                  src={item.imageString || "/placeholder.svg"}
                  fill
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-black/30" />

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 lg:p-12">
                  {/* Top Section - Badge */}
                  <div className="flex justify-between items-start">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 transition-colors"
                    >
                      Featured
                    </Badge>
                    
                  </div>

                  {/* Bottom Section - Main Content */}
                  <div className="space-y-6 pl-[2rem]">
                    <div className="space-y-4">
                      <h1 className="text-2xl md:text-5xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                        {item.title}
                      </h1>
                      <p className="text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed">
                        Discover amazing experiences and unlock new possibilities with our premium collection.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-white/25"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        <Link href="/products">
                        Get Started
                        </Link>
                     
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        <Link href="/products">
                        Shop Now
                        </Link>
                       
                      </Button>
                    </div>

                    {/* Stats or Additional Info */}
                    <div className="flex gap-8 pt-4">
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-white">10K+</div>
                        <div className="text-sm text-white/70">Happy Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-white">4.9</div>
                        <div className="text-sm text-white/70">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-white">24/7</div>
                        <div className="text-sm text-white/70">Support</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 right-8 transform -translate-y-1/2 hidden lg:block">
                  <div className="w-1 h-32 bg-gradient-to-b from-transparent via-white/50 to-transparent rounded-full" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced Navigation */}
        <CarouselPrevious className="ml-6 lg:ml-16 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:text-white w-12 h-12 transition-all duration-300 hover:scale-110" />
        <CarouselNext className="mr-6 lg:mr-16 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 hover:text-white w-12 h-12 transition-all duration-300 hover:scale-110" />
      </Carousel>

      {/* Bottom Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {data.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors cursor-pointer"
          />
        ))}
      </div>
    </div>
  )
}
