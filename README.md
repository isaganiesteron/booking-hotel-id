# Booking Hotel ID

## Description

Booking Hotel ID is a simple helper app designed to extract the hotel name and hotel ID from a booking.com link. This tool leverages the booking.com autosuggest API to retrieve the hotel ID based on the hotel name.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Extract Hotel ID from a single Link**: Copy and paste a booking.com URL, click "Extract," and it will output the hotel name and hotel ID.
- **Extract Hotel IDs from multiple links in CSV**: Upload a CSV full of booking.com links, and it will output a CSV with the hotel name and hotel ID attached. This feature will batch process by 100 rows, pausing for 10 seconds after writing to the CSV to avoid rate limits.
