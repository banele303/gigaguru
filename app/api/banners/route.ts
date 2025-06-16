import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alexsouthflow2@gmail.com") {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, imageString } = body;

    if (!title || !imageString) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing required fields' }), 
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        imageString,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('[BANNERS_POST]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error('[BANNERS_GET]', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }
    );
  }
} 