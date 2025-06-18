import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const cacheKey = `products:${category || 'all'}:${brand || 'all'}:${material || 'all'}:${size || 'all'}:${color || 'all'}:${minPrice || '0'}:${maxPrice || 'all'}:${page}:${limit}`;

  try {
    // Temporarily disable cache for debugging
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return NextResponse.json(cached);
    // }

    const where: any = {
      status: "published",
    };

    if (category) {
      where.category = category.toLowerCase();
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

    console.log('Querying products with filter:', where);
    
    // Get total count for pagination
    const total = await prisma.product.count({ where });
    
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        price: true,
        discountPrice: true,
        isSale: true,
        saleEndDate: true,
        images: true,
        category: true,
        brand: true,
        material: true,
        sizes: true,
        colors: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    
    console.log('Found products:', products.length);

    // Temporarily disable cache for debugging
    // await redis.set(cacheKey, products);
    
    return NextResponse.json({ 
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}