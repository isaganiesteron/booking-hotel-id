export const maxDuration = 60; // This function can run for a maximum of 60 seconds
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hotelName = searchParams.get('name');

  try {
    if (!hotelName) return NextResponse.json({ error: 'Invalid Hotel Name' }, { status: 500 });

    const response = await fetch(`https://accommodations.booking.com/autocomplete.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: hotelName, language: 'en-us', size: 10 }),
    });

    if (response.status === 200) {
      const data = await response.json();
      if (data.results.length > 0) {
        return NextResponse.json({ hotelId: data.results[0].dest_id });
      } else {
        console.log(data.results);
        return NextResponse.json({ error: 'Unable to find Hotel ID' }, { status: 500 });
      }
    } else {
      console.log(response);
      return NextResponse.json({ error: 'Unable to find Hotel ID' }, { status: 500 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
