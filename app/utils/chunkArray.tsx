export default (items: any[]): any[][] => {
  // Split an array into chunks of 100 items and return those chunks in an array
  const chunkSize = 100;
  const chunks: any[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
};
