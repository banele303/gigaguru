import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true }
    });

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    if (products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 400 });
    }

    const devices = ['mobile', 'desktop', 'tablet'];
    const sources = ['direct', 'search', 'social', 'referral'];

    // Create sample ProductView records for the last 30 days
    const productViews = [];
    for (let i = 0; i < 30; i++) {
      const date = subDays(new Date(), i);
      
      // Create 5-20 views per day
      const viewsPerDay = Math.floor(Math.random() * 16) + 5;
      
      for (let j = 0; j < viewsPerDay; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomUser = users.length > 0 && Math.random() > 0.3 ? 
          users[Math.floor(Math.random() * users.length)] : null;
        
        productViews.push({
          productId: randomProduct.id,
          userId: randomUser?.id || null,
          viewedAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          source: sources[Math.floor(Math.random() * sources.length)],
          device: devices[Math.floor(Math.random() * devices.length)],
        });
      }
    }

    // Insert all ProductView records
    await prisma.productView.createMany({
      data: productViews,
      skipDuplicates: true,
    });

    // Also update product view counts
    for (const product of products) {
      const viewCount = productViews.filter(pv => pv.productId === product.id).length;
      await prisma.product.update({
        where: { id: product.id },
        data: { views: { increment: viewCount } }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Created ${productViews.length} product views`,
      productsUpdated: products.length
    });
  } catch (error) {
    console.error("Error seeding product views:", error);
    return NextResponse.json(
      { error: "Failed to seed product views" },
      { status: 500 }
    );
  }
}
