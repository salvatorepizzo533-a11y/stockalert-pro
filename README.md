# Stock Monitor Pro

A product availability tracker with Discord notifications.

## Features

- **Real-time Monitoring**: Track product availability on multiple stores
- **Discord Notifications**: Get instant alerts via Discord webhook when products are back in stock
- **Keyword Filtering**: Set positive and negative keywords to filter products
- **Dashboard Analytics**: View your monitoring statistics and alert history

## How to Use

1. Configure your Discord webhook in Settings
2. Create a new monitor with the URLs you want to track
3. Set keywords to filter specific products
4. Start the monitor and receive Discord notifications when products are available
5. Click the notification link to go directly to the product page

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```

2. Run the app:
   ```
   npm run dev
   ```

## Discord Webhook Setup

1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Create a new webhook and copy the URL
4. Paste the URL in the Settings page of Stock Monitor Pro
5. Click "Test Webhook" to verify the connection

## Note

This is a stock availability monitor only. You must complete the checkout manually.
