import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "R") {
  return `${currency} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)}`;
}

export function formatPriceWithDiscount(originalPrice: number, discountPrice: number | null | undefined, currency: string = "R") {
  if (discountPrice !== null && discountPrice !== undefined && discountPrice < originalPrice) {
    return `${currency} ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(discountPrice)}`;
  } else {
    return `${currency} ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(originalPrice)}`;
  }
}

export function calculateDiscountPercentage(originalPrice: number, discountPrice: number | null | undefined) {
  if (discountPrice !== null && discountPrice !== undefined && discountPrice < originalPrice) {
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  }
  return 0;
} 