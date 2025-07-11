# PostHog Analytics Setup Guide

## Current Status
✅ PostHog client-side tracking is working
✅ Database analytics are working
❌ PostHog server-side analytics need setup

## To Enable Full PostHog Analytics:

### 1. Get Your Personal API Key

1. Go to [PostHog Project Settings](https://app.posthog.com/project/settings)
2. Navigate to **"Personal API Keys"** section
3. Click **"Create new key"**
4. Give it a name like "Ecom Analytics Server"
5. Copy the generated key

### 2. Add the Key to Your Environment

Add this line to your `.env` file:
```bash
POSTHOG_PERSONAL_API_KEY=phc_your_personal_api_key_here
```

### 3. Restart Your Development Server
```bash
npm run dev
```

## What You'll Get After Setup:

### Enhanced Analytics from PostHog:
- **Real Page Views**: All page visits across your entire site
- **Geographic Data**: Country-based visitor analytics
- **Device & Browser Stats**: Detailed device and browser breakdowns
- **Referrer Tracking**: See where visitors come from
- **Session Analytics**: Real user session data
- **User Journey**: Track user paths through your site

### Current Database Analytics:
- **Product Views**: Specific product page visits
- **Sales Data**: Revenue, orders, conversion rates
- **User Data**: Registration and login analytics

## Benefits of Full Integration:
- More accurate visitor counts
- Better understanding of user behavior
- Geographic insights for marketing
- Device optimization opportunities
- Referrer analysis for traffic sources

## Troubleshooting:
- If you see "401 error", your API key might be invalid
- Make sure to restart the server after adding the key
- Check that your PostHog project ID is correct: `171485`
