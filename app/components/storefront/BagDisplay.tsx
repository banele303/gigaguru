"use client";

import { checkOut, delItem, updateCartItemQuantity } from "@/app/actions";
import { ChceckoutButton, DeleteItem } from "@/app/components/SubmitButtons";
import { Cart } from "@/app/lib/interfaces";
import { formatPrice } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CartItem } from "@/app/lib/interfaces";
import { useCart } from "@/app/hooks/useCart";
import posthog from 'posthog-js';

interface BagDisplayProps {
  cart: Cart | null;
}

export function BagDisplay({ cart }: BagDisplayProps) {
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [savings, setSavings] = useState(0);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (cart?.items) {
      const newTotal = cart.items.reduce((sum, item) => {
        const itemPrice = item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price;
        return sum + (itemPrice * item.quantity);
      }, 0);
      setTotalPrice(newTotal);

      const newOriginalTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setOriginalTotal(newOriginalTotal);

      const newSavings = newOriginalTotal - newTotal;
      setSavings(newSavings);
    } else {
      setTotalPrice(0);
      setOriginalTotal(0);
      setSavings(0);
    }
  }, [cart]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      setIsUpdating(prev => ({ ...prev, [itemId]: true }));
      await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Shopping Bag</h1>
      
      {cart?.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your bag is empty</h3>
          <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your bag.</p>
          <div className="mt-6">
            <Link href="/" className="text-sm font-medium text-primary hover:text-primary/90">
              Continue Shopping <span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <ul className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cart?.items.map((item) => {
                const itemTotal = item.discountPrice && item.discountPrice < item.price 
                  ? item.discountPrice * item.quantity 
                  : item.price * item.quantity;
                const itemOriginalTotal = item.price * item.quantity;
                const itemSavings = itemOriginalTotal - itemTotal;

                return (
                  <li key={item.id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={item.imageString}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <div className="flex flex-col items-end">
                            {item.discountPrice && item.discountPrice < item.price ? (
                              <>
                                <p className="text-red-600">{formatPrice(itemTotal)}</p>
                                <p className="text-sm text-gray-500 line-through">{formatPrice(itemOriginalTotal)}</p>
                                <p className="text-sm text-green-600">Save {formatPrice(itemSavings)}</p>
                              </>
                            ) : (
                              <p>{formatPrice(itemTotal)}</p>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                      </div>

                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating[item.id]}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-gray-900 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= 10 || isUpdating[item.id]}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 0)}
                          className="font-medium text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(totalPrice)}</p>
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Savings</p>
                  <p className="text-sm font-medium text-green-600">-{formatPrice(savings)}</p>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">Order total</p>
                <p className="text-base font-medium text-gray-900">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <div className="mt-6">
              <form 
                action={checkOut}
                onSubmit={() => {
                  // Track checkout started with PostHog
                  posthog.capture('checkout_started', {
                    cart_total: totalPrice,
                    cart_items: cart?.items?.length || 0,
                    currency: 'ZAR',
                    item_details: cart?.items?.map(item => ({
                      product_id: item.id,
                      product_name: item.name,
                      quantity: item.quantity,
                      price: item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price,
                    })),
                  });
                }}
              >
                <ChceckoutButton />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
