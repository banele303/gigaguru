import { Suspense } from "react";
import { Cart } from "@/app/lib/interfaces";
import { redis } from "@/app/lib/redis";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { BagDisplay } from "@/app/components/storefront/BagDisplay";

function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto mt-10 min-h-[55vh]">
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-md mb-4" />
        <div className="h-32 bg-gray-200 rounded-md mb-4" />
        <div className="h-32 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

async function BagContent() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const cart: Cart | null = await redis.get(`cart-${user.id}`);

  return <BagDisplay cart={cart} />;
}

export default function BagRoute() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BagContent />
    </Suspense>
  );
}
