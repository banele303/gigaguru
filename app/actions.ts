"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { parse } from "@conform-to/dom";
import { parseWithZod } from "@conform-to/zod";
import { bannerSchema, productSchema, reviewSchema } from "./lib/zodSchemas";
import { prisma } from "@/lib/db";
import { redis } from "./lib/redis";
import { Cart } from "./lib/interfaces";
import { revalidatePath } from "next/cache";
import { stripe } from "./lib/stripe";
import Stripe from "stripe";
import { revalidateTag } from "next/cache";

export async function createProduct(prevState: unknown, formData: FormData) {
  console.log("createProduct action started");
  
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    console.log("Authorization failed for create product");
    return redirect("/");
  }

  console.log("Form data received:", Object.fromEntries(formData.entries()));
  
  const submission = parseWithZod(formData, {
    schema: productSchema,
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

  try {
    // Log all the submission values for debugging
    console.log("Submission values:", {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: submission.value.images,
      category: submission.value.category,
      isFeatured: submission.value.isFeatured,
      sku: submission.value.sku,
      sizes: submission.value.sizes,
      colors: submission.value.colors,
    });
    await prisma.product.create({
      data: {
        name: submission.value.name,
        description: submission.value.description,
        status: submission.value.status,
        price: submission.value.price,
        images: submission.value.images || [],
        category: submission.value.category,
        isFeatured: submission.value.isFeatured ?? false,
        sku: submission.value.sku,
        quantity: submission.value.quantity || 0,
        sizes: submission.value.sizes,
        colors: submission.value.colors,
        userId: user.id,
      },
    });
    
    console.log("Product created successfully");
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2002' &&
      (error as any).meta?.target?.includes('sku')
    ) {
      return {
        status: 'error' as const,
        message: 'A product with this SKU already exists. Please use a unique SKU.',
      };
    }
    
    return {
      status: 'error' as const,
      message: 'Failed to create product. Please try again.',
    };

  }

  revalidateTag("products");

  return {
    status: 'success' as const,
    message: 'Product created successfully!',
  };
}

export async function editProduct(prevState: any, formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: productSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const productId = formData.get("productId") as string;

  try {
    await prisma.product.update({
      where: { id: productId },
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
          sizes: Array.isArray(submission.value.sizes) ? submission.value.sizes : [],
          colors: Array.isArray(submission.value.colors) ? submission.value.colors : [],
      },
    });
  } catch (error) {
      console.error('Error editing product:', error);
      return submission.reply({
          formErrors: ["Failed to edit product."],
      });
  }

  revalidateTag("products");
  redirect("/dashboard/products");
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
      schema: reviewSchema,
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

    revalidatePath(`/product/${productId}`);
    revalidatePath(`/dashboard/products/${productId}`);

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
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return redirect("/");
  }

  const submission = parseWithZod(formData, {
    schema: bannerSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.banner.create({
    data: {
      title: submission.value.title,
      imageString: submission.value.imageString,
    },
  });

  redirect("/dashboard/banner");
}

export async function deleteBanner(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || user.email !== "alexsouthflow2@gmail.com") {
    return redirect("/");
  }

  await prisma.banner.delete({
    where: {
      id: formData.get("bannerId") as string,
    },
  });

  redirect("/dashboard/banner");
}

export async function addItem(productId: string) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return redirect("/");
    }

    // Create a default cart
    let myCart: Cart = { userId: user.id, items: [] };
    
    try {
      // Try to get the existing cart
      const cart: Cart | null = await redis.get(`cart-${user.id}`);
      if (cart && cart.items) {
        myCart = cart;
      }
    } catch (redisError) {
      console.error("Error fetching cart from Redis:", redisError);
      // Continue with the default cart
    }

    try {
      const selectedProduct = await prisma.product.findUnique({
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
        where: {
          id: productId,
        },
      });

      if (!selectedProduct) {
        console.error("Product not found:", productId);
        return { success: false, error: "Product not found" };
      }
      
      if (!myCart.items || myCart.items.length === 0) {
        myCart.items = [
          {
            price: selectedProduct.price,
            id: selectedProduct.id,
            imageString: selectedProduct.images[0] || "",
            name: selectedProduct.name,
            quantity: 1,
          },
        ];
      } else {
        let itemFound = false;

        myCart.items = myCart.items.map((item) => {
          if (item.id === productId) {
            itemFound = true;
            item.quantity = (item.quantity || 0) + 1;
          }
          return item;
        });

        if (!itemFound) {
          myCart.items.push({
            id: selectedProduct.id,
            imageString: selectedProduct.images[0] || "",
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: 1,
          });
        }
      }

      await redis.set(`cart-${user.id}`, myCart);

      revalidatePath("/", "layout");
      return { success: true };
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      return { success: false, error: "Database error" };
    }
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
      return redirect("/");
    }

    // Create a cart object to hold our data
    let myCart: Cart = { userId: user.id, items: [] };
    
    try {
      // Try to fetch existing cart, but handle case where it might not exist
      const cart: Cart | null = await redis.get(`cart-${user.id}`);
      
      if (cart && cart.items) {
        myCart = cart;
      }
    } catch (redisError) {
      console.error("Error fetching cart from Redis:", redisError);
      // We'll continue with an empty cart
    }

    try {
      const selectedProduct = await prisma.product.findUnique({
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
        where: {
          id: productId,
        },
      });

      if (!selectedProduct) {
        return { success: false, error: "Product not found" };
      }
      
      // If cart is empty or has no items
      if (!myCart.items || myCart.items.length === 0) {
        myCart.items = [
          {
            price: selectedProduct.price,
            id: selectedProduct.id,
            imageString: selectedProduct.images[0] || "", // Ensure we have a default
            name: selectedProduct.name,
            quantity,
            size,
            color,
          },
        ];
      } else {
        let itemFound = false;

        myCart.items = myCart.items.map((item) => {
          // Match by product ID, size and color to consider same variant
          if (item.id === productId && item.size === size && item.color === color) {
            itemFound = true;
            item.quantity = (item.quantity || 0) + quantity;
          }
          return item;
        });

        if (!itemFound) {
          myCart.items.push({
            id: selectedProduct.id,
            imageString: selectedProduct.images[0] || "",
            name: selectedProduct.name,
            price: selectedProduct.price,
            quantity,
            size,
            color,
          });
        }
      }

      // Save cart to Redis
      await redis.set(`cart-${user.id}`, myCart);
      
      revalidatePath("/", "layout");
      return { success: true };
      
    } catch (dbError) {
      console.error("Database error:", dbError);
      return { success: false, error: "Error accessing product database" };
    }
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
      return redirect("/");
    }

    const productId = formData.get("productId");
    
    if (!productId) {
      console.error("No product ID provided for deletion");
      return;
    }

    try {
      let cart: Cart | null = await redis.get(`cart-${user.id}`);

      if (cart && cart.items) {
        const updateCart: Cart = {
          userId: user.id,
          items: cart.items.filter((item) => item.id !== productId),
        };

        await redis.set(`cart-${user.id}`, updateCart);
      }

      revalidatePath("/bag");
    } catch (redisError) {
      console.error("Redis error in delItem:", redisError);
    }
  } catch (error) {
    console.error("Error in delItem:", error);
  }
}

export async function checkOut() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return redirect("/");
    }

    try {
      let cart: Cart | null = await redis.get(`cart-${user.id}`);

      if (!cart || !cart.items || cart.items.length === 0) {
        console.warn("Attempting to check out with empty cart");
        return redirect("/bag?error=empty-cart");
      }

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        cart.items.map((item) => ({
          price_data: {
            currency: "usd",
            unit_amount: item.price * 100,
            product_data: {
              name: item.name,
              images: [item.imageString || ''],
            },
          },
          quantity: item.quantity || 1,
        }));

      try {
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: lineItems,
          success_url:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000/payment/success"
              : "https://ecom-pro-coral.vercel.app/payment/success",
          cancel_url:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000/payment/cancel"
              : "https://ecom-pro-coral.vercel.app/payment/cancel",
          metadata: {
            userId: user.id,
          },
        });

        if (session && session.url) {
          return redirect(session.url);
        } else {
          console.error("Stripe session created but no URL returned");
          return redirect("/bag?error=checkout-failed");
        }
      } catch (stripeError) {
        console.error("Stripe checkout error:", stripeError);
        return redirect("/bag?error=payment-processing");
      }
    } catch (redisError) {
      console.error("Redis error in checkOut:", redisError);
      return redirect("/bag?error=cart-retrieval");
    }
  } catch (error) {
    console.error("Error in checkOut:", error);
    return redirect("/bag?error=unexpected");
  }
}
