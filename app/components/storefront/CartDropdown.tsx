"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatPrice } from "@/app/lib/utils";
import { updateCartItemQuantity, getCart, delItem } from '@/app/actions';
import type { CartItem } from '@/app/lib/interfaces';
import Link from 'next/link';

interface CartDropdownProps {
  itemCount: number;
  items: (CartItem & { imageUrl: string })[];
  onClose: () => void;
}

export function CartDropdown({ itemCount, items: initialItems, onClose }: CartDropdownProps) {
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const [items, setItems] = useState(initialItems);

  const refreshCart = async () => {
    try {
      const cart = await getCart();
      if (cart) {
        setItems(cart.items.map(item => ({
          ...item,
          imageUrl: item.imageString,
        })));
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        // Delete item
        const formData = new FormData();
        formData.append("productId", itemId);
        const result = await delItem(formData);
        if (result?.success) {
          toast.success("Item removed from cart");
          // Refresh cart after deletion
          const updatedCart = await getCart();
          if (updatedCart) {
            setItems(updatedCart.items.map(item => ({
              ...item,
              imageUrl: item.imageString,
            })));
          }
        } else {
          toast.error(result?.error || "Failed to remove item");
        }
      } else {
        // Update quantity
        const result = await updateCartItemQuantity(itemId, newQuantity);
        if (result?.success) {
          toast.success("Cart updated");
          // Refresh cart after update
          const updatedCart = await getCart();
          if (updatedCart) {
            setItems(updatedCart.items.map(item => ({
              ...item,
              imageUrl: item.imageString,
            })));
          }
        } else {
          toast.error(result?.error || "Failed to update quantity");
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const total = items.reduce((sum, item) => {
    const itemPrice = item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const originalTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = originalTotal - total;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-[85vh] shadow-2xl rounded-l-2xl overflow-hidden transform transition-all duration-300 ease-out translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">Your Bag</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Your bag is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const itemTotal = item.discountPrice && item.discountPrice < item.price 
                    ? item.discountPrice * item.quantity 
                    : item.price * item.quantity;
                  const itemOriginalTotal = item.price * item.quantity;
                  const itemSavings = itemOriginalTotal - itemTotal;

                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                          {item.discountPrice && item.discountPrice < item.price ? (
                            <div className="flex flex-col items-end">
                              <p className="text-sm font-medium text-red-600">{formatPrice(itemTotal)}</p>
                              <p className="text-xs text-gray-500 line-through">{formatPrice(itemOriginalTotal)}</p>
                              <p className="text-xs text-green-600">Save {formatPrice(itemSavings)}</p>
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{formatPrice(itemTotal)}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center rounded-md border border-gray-200 bg-white">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded-l-md transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1 || isUpdating[item.id]}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-900">
                              {isUpdating[item.id] ? '...' : item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded-r-md transition-colors disabled:opacity-50"
                              disabled={item.quantity >= 10 || isUpdating[item.id]}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item.id, 0)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{formatPrice(total)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Savings</span>
                  <span className="text-sm font-medium text-green-600">-{formatPrice(savings)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-semibold text-gray-900">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <form action={checkOut}>
                <Button type="submit" className="w-full">
                  Checkout
                </Button>
              </form>
              <Button variant="outline" asChild className="w-full">
                <Link href="/bag" onClick={onClose}>View Bag</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 