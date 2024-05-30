const apiCall = async (endpoint: string, fetchBody: object) => {
  let data: any[] = [];

  const token = `Bearer ${process.env.BOOKING_API_KEY}`;
  let next_page = '';

  /**
   * ```http
   * GET /v2.10/roomAvailability?hotel_id=456&checkin_date=2024-06-01&checkout_date=2024-06-07
   * ```
   */
  const url = 'https://api.booking.com/v2.10/roomAvailability';

  console.log(endpoint);
  console.log(fetchBody);
  const { accommodations, checkin, checkout } = fetchBody as {
    accommodations: number[];
    checkin: string;
    checkout: string;
  };

  const requestURL = `${url}?hotel_id=1376973&checkin_date=2024-05-30&checkout_date=2024-05-31`;
  console.log('requestURL', requestURL);

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
