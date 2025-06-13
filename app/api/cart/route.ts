import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';
import { Cart } from '@/app/lib/interfaces';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const cart: Cart | null = await redis.get(`cart-${userId}`);

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
} 