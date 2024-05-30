const bulkAvailabilityFinder = async (
  data: {
    id: number;
    url: string;
    name: string;
  }[]
) => {
  // will not accept data with more than 100 items
  if (data.length > 100) return false;

  let accommodationIds: number[] = []; // as the function will look for individual IDs it will save them headers
  // first get the hotel ID for each accommodation
  let counter = 0;
  while (counter < data.length) {
    const currentAccommodation = data[counter];
    if (currentAccommodation === undefined) break;
    console.log(`${counter + 1}: looking for ${currentAccommodation.name}`);
    const hotelIdRes = await fetch(`/api/autosuggest?name=${currentAccommodation.name}`);
    if (hotelIdRes.status === 200) {
      const hotelIdData = await hotelIdRes.json();
      if (hotelIdData.hotelId) {
        data[counter] = { ...currentAccommodation, id: hotelIdData.hotelId };
        accommodationIds.push(Number(hotelIdData.hotelId));
      }
    } else {
      console.log('ERROR: unable to find hotel ID for: ', currentAccommodation.name);
      console.log(hotelIdRes);
    }
    counter++;
  }

  // then get the availability for each accommodation
  const request = await fetch(`/api/availability`, {
    method: 'POST',
    body: JSON.stringify({ accommodations: accommodationIds }),
  });
  const availability = await request.json();

  console.log('***availability');
  console.log(availability);

  const returnObj = data.map((accommodation) => {
    const currentAccommodation = availability.find((hotel: any) => {
      return Number(hotel.id) === Number(accommodation.id);
    });

    console.log('currentAccommodation', currentAccommodation);

    const result = currentAccommodation
      ? {
          id: accommodation.id,
          url: accommodation.url,
          name: accommodation.name,
          price: currentAccommodation.price,
        }
      : { id: accommodation.id, url: accommodation.url, name: accommodation.name, price: null };

    return result;
  });
  console.log('***returnObj');
  console.log(returnObj);

  return returnObj;
};

export default bulkAvailabilityFinder;
