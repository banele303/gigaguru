"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { parse } from "@conform-to/dom";
import { parseWithZod } from "@conform-to/zod";
import { bannerSchema, createProductSchema, productSchema, reviewSchema, createReviewSchema } from "./lib/zodSchemas";
import { prisma } from "@/lib/db";
import { redis } from "./lib/redis";
import { Cart } from "./lib/interfaces";
import { revalidatePath } from "next/cache";
import { stripe } from "./lib/stripe";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type FlashSaleResult = {
  status: 'success' | 'error';
  message: string;
};

export async function createProduct(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return {
      status: 'error' as const,
      message: 'You are not authorized to create products.',
    };
  }

  try {
    // Check if user exists in database, create if not
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id
      }
    });

    if (!dbUser) {
      // Create the user if they don't exist
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          profileImage: user.picture || '',
          createdAt: new Date()
        }
      });
    }

    // Parse JSON strings from form data
    const images = JSON.parse(formData.get("images") as string || "[]");
    const sizes = JSON.parse(formData.get("sizes") as string || "[]");
    const colors = JSON.parse(formData.get("colors") as string || "[]");
    const isSale = formData.get("isSale") === "true";
    
    // Properly handle discountPrice conversion
    let discountPrice = null;
    const discountPriceStr = formData.get("discountPrice") as string;
    if (discountPriceStr && !isNaN(Number(discountPriceStr))) {
      discountPrice = Number(discountPriceStr);
    }
    
    // Properly handle saleEndDate
    let saleEndDate = null;
    const saleEndDateStr = formData.get("saleEndDate") as string;
    if (saleEndDateStr) {
      const date = new Date(saleEndDateStr);
      if (!isNaN(date.getTime())) {
        saleEndDate = date;
      }
    }

    // Create a new FormData with parsed values
    const parsedFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key === "images") {
        parsedFormData.append(key, JSON.stringify(images));
      } else if (key === "sizes") {
        parsedFormData.append(key, JSON.stringify(sizes));
      } else if (key === "colors") {
        parsedFormData.append(key, JSON.stringify(colors));
      } else if (key === "isSale") {
        parsedFormData.append(key, String(isSale));
      } else if (key === "discountPrice") {
        parsedFormData.append(key, String(discountPrice));
      } else if (key === "saleEndDate") {
        parsedFormData.append(key, saleEndDate ? saleEndDate.toISOString() : "");
      } else {
        parsedFormData.append(key, value as string);
      }
    }

    const submission = parseWithZod(parsedFormData, {
      schema: createProductSchema,
    });

    if (submission.status !== "success") {
      console.log("Validation failed:", submission.error);
      const errorMessages = Object.entries(submission.error ?? {}).map(([key, value]) => `${key}: ${value}`).join('\n');
      return {
        status: 'error' as const,
        message: `Validation failed: ${errorMessages}`,
      };
    }
    
    console.log("Validation passed, submission value:", submission.value);

    const product = await prisma.product.create({
      data: {
        name: submission.value.name,
        description: submission.value.description,
        status: submission.value.status,
        price: submission.value.price,
        images: submission.value.images,
        category: submission.value.category,
        isFeatured: submission.value.isFeatured ?? false,
        sku: submission.value.sku,
        quantity: submission.value.quantity || 0,
        sizes: submission.value.sizes,
        colors: submission.value.colors,
        brand: submission.value.brand || null,
        material: submission.value.material || null,
        userId: user.id,
        isSale: submission.value.isSale ?? false,
        discountPrice: submission.value.isSale ? submission.value.discountPrice : null,
        saleEndDate: submission.value.isSale ? submission.value.saleEndDate : null,
      },
    });
    
    console.log("Product created successfully:", product);
    revalidateTag("products");

    return {
      status: 'success' as const,
      message: 'Product created successfully!',
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      status: 'error' as const,
      message: 'Failed to create product. Please try again.',
    };
  }
}

export async function editProduct(prevState: any, formData: FormData) {
  try {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
      return {
        status: 'error',
        message: 'Unauthorized access'
      };
  }

  // Parse JSON strings from form data
  const images = JSON.parse(formData.get("images") as string || "[]");
  const sizes = JSON.parse(formData.get("sizes") as string || "[]");
  const colors = JSON.parse(formData.get("colors") as string || "[]");
    const isSale = formData.get("isSale") === "true";
    
    // Properly handle discountPrice conversion
    let discountPrice = null;
    const discountPriceStr = formData.get("discountPrice") as string;
    if (discountPriceStr && !isNaN(Number(discountPriceStr))) {
      discountPrice = Number(discountPriceStr);
    }
    
    // Properly handle saleEndDate
    let saleEndDate = null;
    const saleEndDateStr = formData.get("saleEndDate") as string;
    if (saleEndDateStr) {
      const date = new Date(saleEndDateStr);
      if (!isNaN(date.getTime())) {
        saleEndDate = date;
      }
    }

  // Create a new FormData with parsed values
  const parsedFormData = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key === "images") {
      parsedFormData.append(key, JSON.stringify(images));
    } else if (key === "sizes") {
      parsedFormData.append(key, JSON.stringify(sizes));
    } else if (key === "colors") {
      parsedFormData.append(key, JSON.stringify(colors));
    } else if (key === "isSale") {
      parsedFormData.append(key, String(isSale));
    } else if (key === "discountPrice") {
      parsedFormData.append(key, String(discountPrice));
    } else if (key === "saleEndDate") {
        parsedFormData.append(key, saleEndDate ? saleEndDate.toISOString() : "");
    } else {
      parsedFormData.append(key, value as string);
    }
  }

  const submission = parseWithZod(parsedFormData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
      return {
        status: 'error',
        message: 'Validation failed: ' + Object.entries(submission.error ?? {}).map(([key, value]) => `${key}: ${value}`).join(', ')
      };
  }

  const productId = formData.get("productId") as string;

    // Get the existing product to preserve createdAt
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return {
        status: 'error',
        message: 'Product not found'
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: submission.value.name,
        description: submission.value.description,
        status: submission.value.status,
        price: submission.value.price,
        images: images,
        category: submission.value.category,
        isFeatured: submission.value.isFeatured ?? false,
        sku: submission.value.sku,
        quantity: submission.value.quantity || 0,
        sizes: sizes,
        colors: colors,
        discountPrice: isSale ? discountPrice : null,
        isSale: isSale,
        saleEndDate: isSale ? saleEndDate : null,
        createdAt: existingProduct.createdAt, // Preserve original createdAt
        updatedAt: new Date(), // Update the updatedAt timestamp
      },
    });

    revalidateTag("products");
    
    return {
      status: 'success',
      message: 'Product updated successfully',
      data: updatedProduct
    };
  } catch (error) {
    console.error('Error editing product:', error);
    return {
      status: 'error',
      message: 'Failed to update product. Please try again.'
    };
  }
}

export async function deleteProduct(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return redirect("/");
  }

  const productId = formData.get("productId");
  
  if (!productId || typeof productId !== "string") {
    throw new Error("Invalid product ID");
  }

  try {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }

  redirect("/dashboard/products");
}

export async function addReview(prevState: unknown, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return {
      status: "error" as const,
      message: "Please sign in to submit a review.",
    };
  }

  // Log the form data received by the server
  console.log('Server received form data:', {
    rating: formData.get('rating'),
    productId: formData.get('productId'),
    comment: formData.get('comment'),
    userId: user.id
  });

  try {
    const submission = parseWithZod(formData, {
      schema: createReviewSchema,
    });

    if (submission.status !== "success") {
      console.log('Validation failed:', submission.error);
      return {
        status: "error" as const,
        message: "Please provide a valid rating between 1 and 5.",
      };
    }

    const { rating, productId, comment } = submission.value;

    // Additional validation
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return {
        status: "error" as const,
        message: "Please provide a valid rating between 1 and 5.",
      };
    }

    // First, ensure the user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id
      }
    });

    if (!dbUser) {
      // Create the user if they don't exist
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || '',
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          profileImage: user.picture || '',
          createdAt: new Date()
        }
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: productId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return {
        status: "error" as const,
        message: "You have already submitted a review for this product.",
      };
    }

    await prisma.review.create({
      data: {
        rating,
        comment,
        productId,
        userId: user.id,
      },
    });

    revalidateTag("cart");

    return {
      status: 'success' as const,
      message: 'Review submitted successfully!',
    };
  } catch (error) {
    console.error("Error adding review:", error);
    return {
      status: "error" as const,
      message: "Failed to submit review. Please try again.",
    };
  }
}

export async function createBanner(prevState: any, formData: FormData) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alexsouthflow2@gmail.com") {
      return {
        status: "error" as const,
        error: {
          _errors: ["Unauthorized"]
        }
      };
    }

    const submission = parseWithZod(formData, {
      schema: bannerSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const banner = await prisma.banner.create({
      data: {
        title: submission.value.title,
        imageString: submission.value.imageString,
        description: submission.value.description || "", // Default empty description
        link: submission.value.link || "", // Default empty link
      },
    });

    return {
      status: "success" as const,
      banner
    };
  } catch (error) {
    console.error("Error creating banner:", error);
    return {
      status: "error" as const,
      error: {
        _errors: ["Failed to create banner"],
      },
    };
  }
}

export async function deleteBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return redirect("/");
  }

  const bannerId = formData.get("bannerId");

  if (!bannerId || typeof bannerId !== "string") {
    throw new Error("Invalid banner ID");
  }

  try {
    await prisma.banner.delete({
      where: {
        id: bannerId,
      },
    });

    revalidateTag("banners");

    return redirect("/dashboard/banner");
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw new Error("Failed to delete banner");
  }
}

export async function getCart(): Promise<Cart | null> {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return null;
  }

  try {
    const cart: Cart | null = await redis.get(`cart-${user.id}`);
    return cart;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function addItem(productId: string) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    let myCart: Cart = { userId: user.id, items: [] };
    try {
      const cart: Cart | null = await redis.get(`cart-${user.id}`);
      if (cart && cart.items) {
        myCart = cart;
      }
    } catch (redisError) {
      console.error("Error fetching cart from Redis:", redisError);
    }

    const selectedProduct = await prisma.product.findUnique({
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        images: true,
      },
      where: {
        id: productId,
      },
    });

    if (!selectedProduct) {
      return { success: false, error: "Product not found" };
    }

    const existingItem = myCart.items.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
      myCart.items.push({
        id: selectedProduct.id,
        imageString: selectedProduct.images[0] || "",
        name: selectedProduct.name,
        price: selectedProduct.price,
        discountPrice: selectedProduct.discountPrice || undefined,
        quantity: 1,
      });
    }

    await redis.set(`cart-${user.id}`, myCart);

    revalidateTag("cart");

    return { success: true };
  } catch (error) {
    console.error("Error in addItem:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function addItemWithOptions(
  productId: string,
  size?: string,
  color?: string,
  quantity: number = 1
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    let myCart: Cart = { userId: user.id, items: [] };
    try {
      const cart: Cart | null = await redis.get(`cart-${user.id}`);
      if (cart) {
        myCart = cart;
      }
    } catch (redisError) {
      console.error("Error fetching cart from Redis:", redisError);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, discountPrice: true, images: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const existingItemIndex = myCart.items.findIndex(
      (item) => item.id === productId && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
      myCart.items[existingItemIndex].quantity += quantity;
    } else {
      myCart.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice ?? undefined,
        imageString: product.images[0] ?? "",
        quantity,
        size,
        color,
      });
    }

    await redis.set(`cart-${user.id}`, myCart);
    revalidateTag("cart");

    return { success: true };
  } catch (error) {
    console.error("Error in addItemWithOptions:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function delItem(formData: FormData) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const productId = formData.get("productId");
    if (!productId || typeof productId !== "string") {
      return { success: false, error: "Invalid product ID" };
    }

    try {
      const cart: Cart | null = await redis.get(`cart-${user.id}`);

      if (!cart || !cart.items) {
        return { success: false, error: "Cart not found" };
      }

      // Filter out the item to be removed
      const updatedItems = cart.items.filter(item => item.id !== productId);
      
      // If no items left, delete the cart entirely
      if (updatedItems.length === 0) {
        await redis.del(`cart-${user.id}`);
      } else {
        // Update the cart with the filtered items
        const updatedCart: Cart = {
          ...cart,
          items: updatedItems
        };
        // Save the updated cart back to Redis
        await redis.set(`cart-${user.id}`, updatedCart);
      }

      revalidateTag("cart");

      return { success: true };
    } catch (error) {
      console.error("Error in delItem:", error);
      return { success: false, error: "Failed to remove item from cart" };
    }
  } catch (error) {
    console.error("Error in delItem:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateCartItemQuantity(productId: string, quantity: number) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      let cart: Cart | null = await redis.get(`cart-${user.id}`);

      if (!cart || !cart.items) {
        return { success: false, error: "Cart not found" };
      }

      // Get the product details to ensure we have the latest price and discount
      const product = await prisma.product.findUnique({
        select: {
          id: true,
          price: true,
          discountPrice: true,
        },
        where: {
          id: productId,
        },
      });

      if (!product) {
        return { success: false, error: "Product not found" };
      }

      const updatedItems = cart.items.map(item => {
        if (item.id === productId) {
          return { 
            ...item, 
            quantity: Math.max(1, Math.min(quantity, 10)), // Limit quantity between 1 and 10
            price: product.price,
            discountPrice: product.discountPrice || undefined
          };
        }
        return item;
      });

      // Update the cart with the new items
      cart.items = updatedItems;
      
      // Save to Redis
      await redis.set(`cart-${user.id}`, cart);

      revalidateTag("cart");

      return { success: true };
    } catch (redisError) {
      console.error("Redis error in updateCartItemQuantity:", redisError);
      return { success: false, error: "Failed to update cart" };
    }
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function checkOut() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      console.log("No user found, redirecting to login");
      return redirect("/api/auth/login");
    }

    console.log("User authenticated:", user.id);

    // Get cart from Redis with retry logic
    let cart: Cart | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        cart = await redis.get(`cart-${user.id}`);
        console.log(`Cart retrieval attempt ${retryCount + 1}:`, cart ? "Found" : "Not found");
        if (cart) break;
      } catch (redisError) {
        console.error(`Redis error on attempt ${retryCount + 1}:`, redisError);
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      console.warn("Empty cart for user:", user.id);
      return redirect("/bag?error=empty-cart");
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      cart.items.map((item) => {
        const productData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData.ProductData = {
          name: item.name,
        };

        if (item.imageString) {
          productData.images = [item.imageString];
        }

        return {
          price_data: {
            currency: "zar",
            unit_amount: (item.discountPrice ?? item.price) * 100,
            product_data: productData,
          },
          quantity: item.quantity || 1,
        };
      });

    console.log("Creating Stripe session for user:", user.id);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/payment/success"
          : "https://gigaguru.vercel.app/payment/success",
      cancel_url:
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/payment/cancel"
          : "https://gigaguru.vercel.app/payment/cancel",
      metadata: {
        userId: user.id,
      },
    });

    if (session && session.url) {
      console.log("Stripe session created successfully");
      return redirect(session.url);
    } else {
      console.error("Stripe session created but no URL returned");
      return redirect("/bag?error=checkout-failed");
    }
  } catch (error) {
    // The `isRedirectError` function was removed in Next.js 14.
    // The new way to handle redirect errors is to check for a specific digest property on the error object.
    if (
      error instanceof Error &&
      'digest' in error &&
      typeof (error as any).digest === 'string' &&
      (error as any).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    console.error("Error in checkOut:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return redirect("/bag?error=cart-retrieval");
  }
}

export async function clearCart(userId: string) {
  try {
    const cart: Cart | null = await redis.get(`cart-${userId}`);

    if (cart && cart.items.length > 0) {
      const totalAmount = cart.items.reduce((acc, item) => {
        const itemPrice = item.discountPrice ?? item.price;
        return acc + itemPrice * item.quantity;
      }, 0);

      await prisma.order.create({
        data: {
          userId: userId,
          amount: totalAmount * 100,
          status: "pending",
          items: {
            create: cart.items.map((item) => ({
              quantity: item.quantity,
              productId: item.id,
              price: (item.discountPrice ?? item.price) * 100,
            })),
          },
        },
      });

      await redis.del(`cart-${userId}`);
      revalidateTag("cart");
      revalidatePath("/dashboard/banner");
    }

    return { success: true };
  } catch (error) {
    console.error("Error in clearCart:", error);
    return { success: false, error: "Failed to process payment." };
  }
}

export async function createFlashSale(prevState: unknown, formData: FormData): Promise<FlashSaleResult> {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return {
      status: 'error' as const,
      message: 'You are not authorized to create flash sales.',
    };
  }

  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const discountPercentage = parseInt(formData.get('discountPercentage') as string);
    const productIds = JSON.parse(formData.get('productIds') as string) as string[];

    // Create the flash sale
    const flashSale = await prisma.flashSale.create({
      data: {
        name,
        description,
        startDate,
        endDate,
        isActive: true,
        products: {
          create: productIds.map(productId => ({
            productId: productId,
            discountPrice: 0, // This will be calculated based on the product price and discount percentage
          }))
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    // Update the discount prices for each product
    for (const flashSaleProduct of flashSale.products) {
      const originalPrice = flashSaleProduct.product.price;
      const discountPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
      
      await prisma.flashSaleProduct.update({
        where: { id: flashSaleProduct.id },
        data: { discountPrice }
      });
    }

    revalidateTag('flash-sales');
    return {
      status: 'success' as const,
      message: 'Flash sale created successfully!',
    };
  } catch (error) {
    console.error('Error creating flash sale:', error);
    return {
      status: 'error' as const,
      message: 'Failed to create flash sale. Please try again.',
    };
  }
}