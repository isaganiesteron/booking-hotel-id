const hotelNameExtractor = (url: string) => {
  // http://www.booking.com/hotel/th/adelphi-forty-nine.html?aid=1198318&no_rooms=1&group_adults=1&label=Things-To-Do-Bangkok
  if (!url.includes('booking.com')) return false;
  try {
    const urltail = url.split('booking.com/')[1];
    const info = urltail.split('.')[0];
    return info.split('/')[2];
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default hotelNameExtractor;
