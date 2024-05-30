'use server';
import getTimestamp from './getTimestamp';

let csvWriter: any = null;

export const writeToCsv = async (newFile: boolean, filename: string, data: string[][]) => {
  let curCsvWriter = csvWriter;
  if (curCsvWriter === null || newFile) {
    console.log('csvWriter not found. creating new csvWriter');
    curCsvWriter = await createCsvWriter(filename);
  }
  const records = data.map((item) => {
    return {
      meta_id: item[0],
      post_id: item[1],
      meta_key: item[2],
      meta_value: item[3],
      hotel_name: item[4],
      hotel_id: item[5],
    };
  });
  curCsvWriter
    .writeRecords(records) // returns a promise
    .then(() => {
      console.log(`Successfully wrote ${records.length} records to csv file.`);
    });
};

export const createCsvWriter = async (filename: string) => {
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const fileName = `csv/${filename}_done_${getTimestamp()}.csv`;
  console.log(fileName);
  csvWriter = createCsvWriter({
    path: fileName,
    header: [
      { id: 'meta_id', title: 'META ID' },
      { id: 'post_id', title: 'POST ID' },
      { id: 'meta_value', title: 'URL' },
      { id: 'hotel_name', title: 'HOTEL NAME' },
      { id: 'hotel_id', title: 'HOTEL ID' },
    ],
  });
  return csvWriter;
};
export default writeToCsv;
