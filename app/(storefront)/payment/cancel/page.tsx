"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import Link from "next/link";

function CancelContent() {
  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <X className="w-12 h-12 rounded-full bg-red-500/30 text-red-500 p-2" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h3 className="text-lg leading-6 font-medium">
              Payment Cancelled
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment was cancelled. You can try again or return to the homepage.
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

export default function CancelRoute() {
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
      <CancelContent />
    </Suspense>
  );
}
