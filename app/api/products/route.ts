import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { redis } from "@/app/lib/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const material = searchParams.get("material");
  const size = searchParams.get("size");
  const color = searchParams.get("color");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${material || 'all'}:${size || 'all'}:${color || 'all'}:${minPrice || '0'}:${maxPrice || 'all'}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const where: any = {
      status: "published",
    };

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (material) {
      where.material = material;
    }

    if (size) {
      where.sizes = {
        has: size,
      };
    }

    if (color) {
      where.colors = {
        has: color,
      };
    }

    if (minPrice) {
      where.price = {
        gte: parseInt(minPrice),
      };
    }

    if (maxPrice) {
      where.price = {
        ...where.price,
        lte: parseInt(maxPrice),
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    await redis.set(cacheKey, products);

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}