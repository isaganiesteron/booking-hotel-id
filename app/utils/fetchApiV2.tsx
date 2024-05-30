const apiCall = async (endpoint: string, fetchBody: object) => {
  let data: any[] = [];

  const token = `Basic ${process.env.BOOKING_API_KEY}`;
  let next_page = '';

  /**
   * servers:
   * https://demandapi-sandbox.booking.com/3.1/
   * https://demandapi.booking.com/3.1/
   */

  console.log(endpoint);
  console.log(fetchBody);
  const { accommodations, checkin, checkout } = fetchBody as {
    accommodations: number[];
    checkin: string;
    checkout: string;
  };

  const requestURL = `https://distribution-xml.booking.com/2.10/accommodations/availability?city_ids=-2140479&checkin=2024-06-01&checkout=2024-06-05&room1=A,A&guest_country=US`;
  // const requestURL = `https://distribution-xml.booking.com/2.10${endpoint}?accommodation=${accommodations[0]}&checkin=${checkin}checkout=${checkout}&room1=A,A&guest_country=US`;
  console.log(requestURL);

  const response = await fetch(requestURL, {
    headers: {
      // 'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
    },
  });

  console.log('response', response);
  if (response.status === 200) {
    try {
      const res = await response.json();
      if (res.data) {
        data.push(...res.data);
      } else if (res.errors) {
        console.log('**ERROR1');
        console.log(res);
        next_page = '';
      }

      if (res.next_page) {
        next_page = res.next_page;
      } else {
        next_page = '';
      }
    } catch (err) {
      console.log('**ERROR2');
      console.log(err);
      next_page = '';
    }
  } else {
    console.log(`     ***Status ${response.status}`);
    try {
      const res = await response.json();
      console.log(res);
    } catch (e) {
      if (response.status !== 429) console.log(response);
    }
    next_page = '';
  }
  console.log(`     Fetched ${data.length} items.`);

  console.log('');
  console.log('');

  return { next_page, data };
};

export default apiCall;
