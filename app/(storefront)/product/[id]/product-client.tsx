"use client";

import { useState, useEffect, Suspense } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useFormState } from 'react-dom';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { Minus, Plus, Check, ShoppingBag, X } from 'lucide-react';
import StarRatings from 'react-star-ratings';
import { reviewSchema } from '@/app/lib/zodSchemas';
import { addReview, addItemWithOptions, getCart, updateCartItemQuantity } from '@/app/actions';
import { SubmitButton } from '@/app/components/SubmitButtons';
import { ImageSlider } from '@/app/components/storefront/ImageSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatPrice } from "@/app/lib/utils";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import Image from 'next/image';
import type { ProductWithReviews, Review } from './page';
import posthog from 'posthog-js';
import type { Cart, CartItem } from '@/app/lib/interfaces';
import { CartDropdown } from '@/app/components/storefront/CartDropdown';

interface ProductClientProps {
  product: ProductWithReviews;
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
}

// New type definition for cart item with image
type CartItemWithImage = CartItem & {
  imageUrl: string;
};

type ActionResult = {
    status: 'success' | 'error';
    message: string;
} | undefined;

// Review Form Component
function ReviewForm({ productId }: { productId: string }) {
    const { user } = useKindeBrowserClient();
    const [lastResult, action] = useFormState(addReview, undefined);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [form, fields] = useForm({
        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: reviewSchema });
        },
        lastResult,
    });

    useEffect(() => {
        if (lastResult?.status === 'success') {
            toast.success(lastResult.message);
            const formElement = document.getElementById(form.id) as HTMLFormElement;
            if (formElement) {
                formElement.reset();
                setSelectedRating(0);
            }
        } else if (lastResult?.status === 'error') {
            toast.error(lastResult.message);
        }
    }, [lastResult, form.id]);

    if (!user) {
        return (
            <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-center">Please sign in to leave a review</p>
            </div>
        );
    }

    return (
        <form 
            id={form.id} 
            action={action} 
            className="space-y-4 mt-8"
            onSubmit={(e) => {
                e.preventDefault();
                if (selectedRating === 0) {
                    toast.error("Please select a rating between 1 and 5");
                    return;
                }
                const formData = new FormData(e.currentTarget);
                formData.set('rating', selectedRating.toString());
                action(formData);
            }}
        >
            <h3 className="text-lg font-medium">Write a Review</h3>
            <input type="hidden" name="productId" value={productId} />
            <div>
                <label htmlFor="rating" className="block text-sm font-medium text-foreground mb-1">Rating</label>
                <StarRatings
                    rating={selectedRating}
                    starRatedColor="gold"
                    changeRating={(newRating) => {
                        const rating = Number(newRating);
                        if (rating >= 1 && rating <= 5) {
                            setSelectedRating(rating);
                            console.log('Rating changed to:', rating);
                        }
                    }}
                    numberOfStars={5}
                    name="rating"
                    starDimension="24px"
                    starSpacing="2px"
                />
                <input 
                    type="hidden" 
                    name="rating" 
                    value={selectedRating} 
                />
                {selectedRating === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select a rating</p>
                )}
            </div>
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-1">Review (optional)</label>
                <Textarea 
                    id="comment" 
                    name="comment" 
                    rows={3} 
                    className="w-full" 
                    placeholder="Share your thoughts about this product..." 
                    defaultValue={fields.comment.initialValue as any} 
                />
                <p className="text-red-500 text-sm mt-1">{fields.comment.errors}</p>
            </div>
            <div className="flex justify-end">
                <SubmitButton text="Submit Review" />
            </div>
        </form>
    );
}

// Reviews List Component
function ReviewsList({ reviews }: { reviews: ProductClientProps['reviews'] }) {
  if (reviews.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <h3 className="text-lg font-medium">Customer Reviews</h3>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {review.user.profileImage ? (
                  <Image 
                    src={review.user.profileImage} 
                    alt={`${review.user.firstName} ${review.user.lastName}`} 
                    className="h-full w-full object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="text-muted-foreground font-medium">{review.user.firstName?.[0]}{review.user.lastName?.[0]}</span>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium">{review.user.firstName} {review.user.lastName}</h4>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <StarRatings
                    rating={Number(review.rating) || 0}
                    starRatedColor="gold"
                    numberOfStars={5}
                    name={`rating-${review.id}`}
                    starDimension="16px"
                    starSpacing="1px"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {review.comment && <p className="mt-2 text-foreground">{review.comment}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Product Details Component
function ProductDetails({ product, averageRating, reviewCount }: Omit<ProductClientProps, 'reviews'>) {
  const { trackPageView, trackCartAdd } = useAnalytics();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<CartItemWithImage[]>([]);

  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    setQuantity(1);
    
    // Track product view with PostHog
    posthog.capture('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
      is_sale: product.isSale,
      discount_price: product.discountPrice,
    });
  }, [product.id, product.sizes, product.colors]);

  // Add countdown timer effect
  useEffect(() => {
    if (product.isSale && product.saleEndDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endDate = new Date(product.saleEndDate!).getTime();
        const distance = endDate - now;

        if (distance < 0) {
          setTimeLeft('Sale ended');
          clearInterval(timer);
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [product.isSale, product.saleEndDate]);

  const handleAddToCart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSize || !selectedColor) {
      toast.error("Please select both size and color");
      return;
    }
    
    try {
      const result = await addItemWithOptions(
        product.id, 
        selectedSize,
        selectedColor,
        quantity
      );
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Added to cart");
        // Track add to cart with PostHog
        posthog.capture('product_added_to_cart', {
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor,
          is_sale: product.isSale,
          discount_price: product.discountPrice,
        });

        // Update cart count and show dropdown
        const updatedCart = await getCart();
        if (updatedCart) {
          setCartItemCount(updatedCart.items.length);
          setCartItems(updatedCart.items.map(item => ({
            ...item,
            imageUrl: item.imageString,
          })));
        }
        setShowCartDropdown(true);
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const renderStars = (rating: number) => {
    const validRating = Math.min(Math.max(Number(rating) || 0, 0), 5);
    return (
      <div className="flex items-center">
        <StarRatings
          rating={validRating}
          starRatedColor="gold"
          numberOfStars={5}
          name="average-rating"
          starDimension="20px"
          starSpacing="2px"
        />
        <span className="ml-2 text-sm text-muted-foreground">{validRating.toFixed(1)} ({reviewCount} reviews)</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Product Header */}
      <div className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">{product.name}</h1>
        
        {/* Pricing Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline gap-4">
            {product.isSale && product.discountPrice != null && product.discountPrice! < product.price ? (
              <>
                <div className="flex flex-col">
                  <p className="text-3xl font-bold text-red-600">{formatPrice(product.discountPrice)}</p>
                  <p className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</p>
                </div>
                <span className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-full">
                  Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <p className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>
            )}
          </div>

          {/* Stock Status and Sale Timer */}
          <div className="flex flex-wrap items-center gap-4">
            <p className={`text-sm font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.quantity > 0 ? `${product.quantity} items in stock` : 'Out of stock'}
            </p>
            {product.isSale && product.saleEndDate && (
              <div className="flex items-center gap-2 text-sm font-medium bg-red-100 text-red-700 px-4 py-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-timer"
                >
                  <path d="M10 2h4" />
                  <path d="M12 14v4" />
                  <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
                </svg>
                <span>Sale ends in: {timeLeft}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-x-2">
            {renderStars(averageRating)}
            <span className="text-sm text-gray-600">({reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
        <div className="prose prose-base text-gray-600 max-w-none">
          <p>{product.description}</p>
        </div>
      </div>

      {/* Form for options and add to cart */}
      <form onSubmit={handleAddToCart} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    selectedSize === size
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors */}
        {product.colors?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Color</h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color: string) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`relative h-10 w-10 rounded-full border-2 transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    selectedColor === color ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                >
                  {selectedColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t border-gray-200">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity(p => Math.max(p - 1, 1))}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(p => Math.min(p + 1, 10))}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg transition-colors disabled:opacity-50"
              disabled={quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed transition-all"
            disabled={(product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Add to Bag
          </button>
        </div>
        {((product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) && (
          <p className="text-sm text-red-600 mt-2">Please select options to add to bag.</p>
        )}
      </form>

      {/* Review Section Trigger */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg border border-gray-100">
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant="outline"
          className="w-full py-3 border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          {showReviewForm ? 'Cancel Review' : 'Write a Review'}
        </Button>
        {showReviewForm && <ReviewForm productId={product.id} />}
      </div>

      {/* Cart Dropdown */}
      {showCartDropdown && (
        <CartDropdown
          itemCount={cartItemCount}
          items={cartItems}
          onClose={() => setShowCartDropdown(false)}
        />
      )}
    </div>
  );
}

// Loading skeleton for product details
function LoadingProductDetails() {
  return (
    <div className="flex flex-col gap-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Product Header Skeleton */}
      <div className="space-y-6">
        <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="mt-8">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
        <div className="space-y-3">
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 flex-1 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Main Client Component
export default function ProductClient({ product, averageRating, reviewCount, reviews }: ProductClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start lg:gap-x-24">
          <div className="sticky top-4">
            <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div>
            <LoadingProductDetails />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start lg:gap-x-24">
        <div className="sticky top-4">
          <ImageSlider images={product.images} />
        </div>
        <div>
          <ProductDetails product={product} averageRating={averageRating} reviewCount={reviewCount} />
          <div className="mt-16">
            <ReviewsList reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for product cards
function LoadingProductCard() {
  return (
    <div className="rounded-lg">
      <div className="w-full mx-auto">
        <div className="relative h-[330px]">
          <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="mt-4">
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
