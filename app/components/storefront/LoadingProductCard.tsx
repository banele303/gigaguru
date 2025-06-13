import { Skeleton } from "@/components/ui/skeleton";

export function LoadingProductCard() {
  return (
    <div className="rounded-lg">
      <div className="w-full mx-auto">
        <div className="relative h-[330px]">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      </div>
      <div className="mt-4">
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}
