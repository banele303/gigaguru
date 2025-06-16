import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import { productSchema } from "@/app/lib/zodSchemas";
import { parseWithZod } from "@conform-to/zod";
import { revalidateTag } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alexsouthflow2@gmail.com") {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    // Parse JSON strings from form data
    const images = JSON.parse(formData.get("images") as string || "[]");
    const sizes = JSON.parse(formData.get("sizes") as string || "[]");
    const colors = JSON.parse(formData.get("colors") as string || "[]");
    const isSale = formData.get("isSale") === "true";
    const discountPrice = formData.get("discountPrice") ? Number(formData.get("discountPrice")) : null;
    const saleEndDateString = formData.get("saleEndDate") as string | null;
    const saleEndDate = saleEndDateString ? new Date(saleEndDateString) : null;

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
        parsedFormData.append(key, String(saleEndDate));
      } else {
        parsedFormData.append(key, value as string);
      }
    }

    const submission = parseWithZod(parsedFormData, {
      schema: productSchema,
    });

    if (submission.status !== "success") {
      return NextResponse.json(
        { 
          message: 'Validation failed: ' + Object.entries(submission.error ?? {}).map(([key, value]) => `${key}: ${value}`).join(', ')
        },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id: params.id },
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
        discountPrice: submission.value.discountPrice || null,
        isSale: submission.value.isSale ?? false,
        saleEndDate: submission.value.saleEndDate || null,
      },
    });

    revalidateTag("products");
    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
} 