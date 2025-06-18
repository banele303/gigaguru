import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["draft", "published", "archived"]),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPrice: z.coerce.number().optional().nullable(),
  isSale: z.coerce.boolean().optional().default(false),
  saleEndDate: z.coerce.date().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["men", "women", "kids", "sports", "home", "beauty", "jewellery", "technology", "brands", "deals", "sale"]),
  isFeatured: z.coerce.boolean().optional().default(false),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative").default(0),
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  brand: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  views: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["draft", "published", "archived"]),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPrice: z.coerce.number().optional().nullable(),
  isSale: z.coerce.boolean().optional().default(false),
  saleEndDate: z.coerce.date().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["men", "women", "kids", "sports", "home", "beauty", "jewellery", "technology", "brands", "deals", "sale"]),
  isFeatured: z.coerce.boolean().optional().default(false),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative").default(0),
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  brand: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.isSale) {
      if (!data.discountPrice) return false;
      if (data.discountPrice >= data.price) return false;
      if (!data.saleEndDate) return false;
      if (data.saleEndDate <= new Date()) return false;
    }
    return true;
  },
  {
    message: "When a product is on sale, it must have a valid discount price (less than regular price) and a future sale end date",
    path: ["isSale"], // This will show the error on the isSale field
  }
);

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["draft", "published", "archived"]),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  discountPrice: z.coerce.number().optional().nullable(),
  isSale: z.coerce.boolean().optional().default(false),
  saleEndDate: z.coerce.date().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  category: z.enum(["men", "women", "kids", "sports", "home", "beauty", "jewellery", "technology", "brands", "deals", "sale"]),
  isFeatured: z.coerce.boolean().optional().default(false),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative").default(0),
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  brand: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
  productId: z.string(),
});

export const reviewSchema = z.object({
  id: z.string(),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
  productId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageString: z.string().min(1, "Image is required"),
  description: z.string().optional().default(""),
  link: z.string().optional().default("")
});

export const emailCampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "scheduled", "sent", "failed"]),
  scheduledAt: z.date().nullable(),
  sentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string()
});

export const emailCampaignRecipientSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  subscriberId: z.string(),
  status: z.enum(["pending", "sent", "failed"]),
  sentAt: z.date().nullable(),
  error: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const refundSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  userId: z.string(),
  reason: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  order: z.object({
    amount: z.number(),
  }),
});

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  orderItems: z.array(z.object({
    id: z.string(),
    orderId: z.string(),
    productId: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
});

// Export types
export type Product = z.infer<typeof productSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Banner = z.infer<typeof bannerSchema>;
export type EmailCampaign = z.infer<typeof emailCampaignSchema>;
export type EmailCampaignRecipient = z.infer<typeof emailCampaignRecipientSchema>;
export type Refund = z.infer<typeof refundSchema>;
export type Order = z.infer<typeof OrderSchema>;

// Combined types
export type EmailCampaignWithRecipients = EmailCampaign & {
  recipients: Pick<EmailCampaignRecipient, 'subscriberId'>[];
};
