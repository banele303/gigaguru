import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export interface BannerData {
  id: string;
  title: string;
  imageString: string;
}

export function Hero({ data }: { data: BannerData[] }) {
  return (
    <Carousel>
      <CarouselContent>
        {data.map((item: BannerData) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[50vh] lg:h-[80vh]">
              <Image
                alt="Banner Image"
                src={item.imageString}
                fill
                className="object-cover w-full h-full rounded-xl"
              />
              <div className="absolute top-8 left-6 bg-opacity-75 bg-black text-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
                <h1 className="text-xl lg:text-4xl font-bold">{item.title}</h1>

              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-16" />
      <CarouselNext className="mr-16" />
    </Carousel>
  );
}
