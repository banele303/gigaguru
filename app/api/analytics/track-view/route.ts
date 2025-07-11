import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { productId, productName, price, source = 'direct' } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Get user session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Get device info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                      userAgent.includes('Tablet') ? 'tablet' : 'desktop';

    // Track with PostHog server-side
    const postHogProjectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
    const postHogPersonalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

    if (postHogProjectId && postHogPersonalApiKey) {
      try {
        const distinctId = user?.id || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const eventData = {
          event: 'product_view',
          properties: {
            product_id: productId,
            product_name: productName || 'Unknown Product',
            product_price: price || 0,
            source: source,
            device_type: deviceType,
            user_agent: userAgent,
            timestamp: new Date().toISOString(),
            $current_url: request.url,
            $ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
            user_id: user?.id || null,
            is_authenticated: !!user?.id,
          },
          distinct_id: distinctId,
          timestamp: new Date().toISOString(),
        };

        const response = await fetch(`https://us.i.posthog.com/capture/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${postHogPersonalApiKey}`,
          },
          body: JSON.stringify({
            api_key: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
            event: eventData.event,
            properties: eventData.properties,
            distinct_id: eventData.distinct_id,
            timestamp: eventData.timestamp,
          }),
        });

        if (!response.ok) {
          console.warn('PostHog tracking failed:', response.status, response.statusText);
        }
      } catch (postHogError) {
        console.warn('PostHog server-side tracking failed:', postHogError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking product view:", error);
    return NextResponse.json(
      { error: "Failed to track product view" },
      { status: 500 }
    );
  }
}
