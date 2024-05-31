export const maxDuration = 60; // This function can run for a maximum of 60 seconds
import { NextResponse } from 'next/server';
import fetchApi from '../../utils/fetchApi';

export async function POST(request: Request) {
  const body = await request.json();
  const { accommodation } = body;

  try {
    const requestBody = {
      checkin: body.checkin,
      checkout: body.checkout,
      guests: body.guests,
      accommodations: [accommodation],
      booker: {
        country: 'nl',
        platform: 'desktop',
      },
    };

    // get availability of current hotel
    const hotelData = await fetchApi('/accommodations/search', requestBody);

    if (hotelData.data.length === 0) {
      // current hotel is NOT available
      /**
       * search for alternatives
       * - Look other hotels within 500m that is available
       * - within +/- 25% of price
       * - within +/- 1 of score
       * If not available get get accommodation/details to get the location
       * then use that location to look for other hotels
       */

      // get the location of current hotel
      const hotelLocation = await fetchApi('/accommodations/details', {
        accommodations: [accommodation],
      }).then((res) => res.data[0].location);

      const nearbyRequestBody = {
        checkin: body.checkin,
        checkout: body.checkout,
        guests: body.guests,
        coordinates: {
          latitude: hotelLocation.coordinates.latitude,
          longitude: hotelLocation.coordinates.longitude,
          radius: 0.5,
        },
        booker: {
          country: 'nl',
          platform: 'desktop',
        },
      };

      // find hotels within 500m of current hotel
      const nearbyHotels = await fetchApi('/accommodations/search', nearbyRequestBody);

      // find review scores of nearby hotels and sort by scored
      const nearbyHotelDetails = await fetchApi('/accommodations/details', {
        accommodations: nearbyHotels.data.map((hotel) => Number(hotel.id)),
      });
      const nearbyHotelPriceAndDetail = nearbyHotels.data.map((hotel) => {
        const detail = nearbyHotelDetails.data.find((d) => d.id === hotel.id);
        return {
          ...hotel,
          detail,
        };
      });

      // first sort by price then by score
      const sortedByPriceNearbyHotels = nearbyHotelPriceAndDetail.sort(
        (a, b) => a.price.total - b.price.total
      );
      const sortedByScoreNearbyHotels = sortedByPriceNearbyHotels.sort(
        (a, b) => b.detail.rating.review_score - a.detail.rating.review_score
      );

      return NextResponse.json({
        id: accommodation,
        available: false,
        alternative: sortedByScoreNearbyHotels,
      });
    } else {
      // current hotel is available
      return NextResponse.json({ ...hotelData.data[0], available: true, alternative: null });
    }
  } catch (error: any) {
    return NextResponse.json(error.message, { status: 500 });
  }
}
