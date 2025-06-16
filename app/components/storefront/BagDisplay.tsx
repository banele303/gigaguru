"use client";

import { checkOut, delItem } from "@/app/actions";
import { ChceckoutButton, DeleteItem } from "@/app/components/SubmitButtons";
import { Cart } from "@/app/lib/interfaces";
import { formatPrice } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BagDisplayProps {
  cart: Cart | null;
}

export function BagDisplay({ cart }: BagDisplayProps) {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (cart?.items) {
      const newTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotalPrice(newTotal);
    } else {
      setTotalPrice(0);
    }
  }, [cart]);

  return (
    <div className="max-w-2xl mx-auto mt-10 min-h-[55vh]">
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center mt-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            You dont have any products in your Bag
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            You currently dont have any products in your shopping bag. Please
            add some so that you can see them right here.
          </p>

          <Button asChild>
            <Link href="/">Shop Now!</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-y-10">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex">
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                <Image
                  className="rounded-md object-cover"
                  fill
                  src={item.imageString}
                  alt="Product image"
                />
              </div>
              <div className="ml-5 flex justify-between w-full font-medium">
                <p className="text-gray-900">{item.name}</p>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-x-2">
                    <p className="text-gray-700">{item.quantity} x</p>
                    <p className="text-gray-900 font-semibold">{formatPrice(item.price)}</p>
                  </div>

                  <form action={delItem} className="text-end">
                    <input type="hidden" name="productId" value={item.id} />
                    <DeleteItem />
                  </form>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-10">
            <div className="flex justify-between">
              <p className="text-gray-900 font-semibold">Total</p>
              <p className="text-gray-900 font-bold text-lg">{formatPrice(totalPrice)}</p>
            </div>

            <form action={checkOut}>
              <ChceckoutButton />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
