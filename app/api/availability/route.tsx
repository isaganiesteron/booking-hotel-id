export const maxDuration = 60; // This function can run for a maximum of 60 seconds
import { NextResponse } from 'next/server';
import fetchApi from '../../utils/fetchApi';
import fetchApiV2 from '../../utils/fetchApiV2';

export async function POST(request: Request) {
  const body = await request.json();
  const { accommodations } = body;

  try {
    const requestBody = {
      ...body,
      booker: {
        country: 'nl',
        platform: 'desktop',
      },
    };
    const hotelData = await fetchApiV2('/accommodations/availability', requestBody);
    // const hotelData = await fetchApi('/accommodations/search', requestBody);
    const data = accommodations.map((accommodation: number) => {
      const currentAccommodation = hotelData.data.find((hotel: any) => hotel.id === accommodation);
      const result = currentAccommodation
        ? currentAccommodation
        : { id: accommodation, price: 'unavailable' };
      return result;
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 500 });
  }
}
