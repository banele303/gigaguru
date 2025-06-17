"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { clearCart } from "@/app/actions";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

function SuccessContent() {
  const { user } = useKindeBrowserClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      clearCart(user.id)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to clear cart", err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <section className="w-full min-h-[80vh] flex items-center justify-center">
        <p>Clearing your cart...</p>
      </section>
    );
  }

  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <Check className="w-12 h-12 rounded-full bg-green-500/30 text-green-500 p-2" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h3 className="text-lg leading-6 font-medium">
              Payment Successful
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Congrats on your purchase. Your payment was successful. We hope
              you enjoy your product.
            </p>

            <Button asChild className="w-full mt-5 sm:mt-6">
              <Link href="/">Back to Homepage</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

export default function SuccessRoute() {
  return (
    <Suspense fallback={
      <section className="w-full min-h-[80vh] flex items-center justify-center">
        <Card className="w-[350px]">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto" />
              <div className="h-4 bg-gray-200 rounded mt-3 w-3/4 mx-auto" />
              <div className="h-3 bg-gray-200 rounded mt-2 w-full" />
              <div className="h-10 bg-gray-200 rounded mt-5 w-full" />
            </div>
          </div>
        </Card>
      </section>
    }>
      <SuccessContent />
    </Suspense>
  );
}
