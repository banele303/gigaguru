import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alexsouthflow2@gmail.com") {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, imageString, description, link } = body;

    if (!title || !imageString) {
      return NextResponse.json(
        { message: 'Title and image are required' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        imageString,
        description: description || '',
        link: link || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error('[BANNERS_POST]', error);
    return NextResponse.json(
      { message: 'Failed to create banner' },
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
    return NextResponse.json(
      { message: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
} 