'use server';
const axios = require('axios');

export default async (fetchBody: any) => {
  // Define the endpoint and parameters
  const token = `Bearer ${process.env.BOOKING_API_KEY}`;
  const url = 'https://api.booking.com/v2.10/roomAvailability';
  const hotelIds = '1376973'; // Comma-separated list of hotel IDs
  const params = {
    hotel_id: hotelIds,
    checkin_date: '2024-06-01',
    checkout_date: '2024-06-02',
  };

  // Make the GET request
  axios
    .get(url, {
      params: params,
      headers: {
        Authorization: token,
      },
    })
    .then((response: { data: { availability: any } }) => {
      const availability = response.data.availability;
      availability.forEach((hotel: { hotel_id: any; rooms: any[] }) => {
        console.log(`Hotel ID: ${hotel.hotel_id}`);
        hotel.rooms.forEach((room) => {
          console.log(`Room Type: ${room.room_type}`);
          console.log(`Availability: ${room.available}`);
          console.log('-----');
        });
      });
    })
    .catch((error: { response: { status: any; statusText: any } }) => {
      console.error(`Error: ${error.response.status} - ${error.response.statusText}`);
    });
};
