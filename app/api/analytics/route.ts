import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/app/lib/getAnalytics";

export async function POST(req: Request) {
  try {
    const { startDate, endDate } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const data = await getAnalyticsData(new Date(startDate), new Date(endDate));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch analytics data";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await getAnalyticsData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch analytics data";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 