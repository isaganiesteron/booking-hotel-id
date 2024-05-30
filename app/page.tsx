'use client';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import CSVReader from 'react-csv-reader';
import hotelNameExtractor from './utils/hotelNameExtractor';
import Link from 'next/link';
import { write } from 'fs';
import writeToCsv from './utils/writeToCsv';
import { createCsvWriter } from './utils/writeToCsv';
import chunkArray from './utils/chunkArray';
import getTimestamp from './utils/getTimestamp';
import eta from './utils/eta';

export default function Home() {
  const [tempAllLinks, setTempAllLinks] = useState<string[]>([]);
  const [currentlLink, setCurrentLink] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [accommodationList, setAccommodationList] = useState<
    | {
        id: number;
        url: string;
        name: string;
      }[]
    | null
  >(null);

  const [postResult, setPostResult] = useState<object[]>();
  const [postBody, setPostBody] = useState<string>(
    JSON.stringify(
      {
        accommodations: [1376973],
        checkin: moment().format('YYYY-MM-DD'),
        checkout: moment().add(1, 'days').format('YYYY-MM-DD'),
        guests: {
          number_of_adults: 2,
          number_of_rooms: 1,
        },
      },
      undefined,
      4
    )
  );

  const handleFind = async (currentlLink: string) => {
    setResult('');
    const hotelName = hotelNameExtractor(currentlLink);
    if (!hotelName) {
      setResult('The link is not a valid booking.com link.');
      return;
    }
    const hotelIdRes = await fetch(`/api/autosuggest?name=${hotelName}`);
    const hotelId = await hotelIdRes.json();

    if (hotelId.hotelId) {
      setAccommodationList([
        {
          id: hotelId.hotelId,
          url: currentlLink,
          name: hotelName,
        },
      ]);
    }
  };

  const handleFileLoaded = async (data: any, fileInfo: any, originalFile: any) => {
    const cleanData = data.filter((x: any) => {
      if (x.length !== 4) return false;
      return x[3].includes('booking.com/hotel');
    });

    let newFile = true;
    const fileName = fileInfo.name.split('.csv')[0] || 'csvfile';

    setResult(`Found ${cleanData.length} links. `);
    let start = performance.now();

    // first chunk main array into smaller arrays of 100 items
    const batches = chunkArray(cleanData);
    let batchCount = 0;

    while (batchCount < batches.length) {
      console.log(`Processing chunk ${batchCount + 1} of ${batches.length}`);

      const currentBatch = batches[batchCount];

      let counter = 0;
      let currentBatchData: any[] = [];

      while (counter < currentBatch.length) {
        const currentRow = currentBatch[counter];
        const currenName = await hotelNameExtractor(currentRow[3]);
        let currenId = 'NA';
        console.log(`Current name: ${currenName}`);

        const hotelIdRes = await fetch(`/api/autosuggest?name=${currenName}`);
        if (hotelIdRes.status === 200) {
          const hotelIdData = await hotelIdRes.json();
          if (hotelIdData.hotelId) {
            setResult(
              `Found ${cleanData.length} links. Batch ${batchCount + 1} of ${
                batches.length
              }: Extracting IDs: ${((counter / currentBatch.length) * 100).toFixed(0)}%`
            );
            currenId = hotelIdData.hotelId;
          } else {
            console.log(`${counter + 1}: Unable to find ID for ${currenName}`);
          }
        } else {
          console.log(`${counter + 1}: ERROR: Unable to find ID for ${currenName}`);
        }
        currentBatchData.push([...currentRow, currenName, currenId]);

        counter++;
      }
      await writeToCsv(newFile, fileName, currentBatchData);
      newFile = false;
      // create a 10 second pause here to avoid rate limiting
      if (batchCount !== batches.length - 1)
        await new Promise((resolve) => setTimeout(resolve, 10000));
      batchCount++;
    }

    let end = performance.now();
    const timeTaken = eta(end - start);
    setResult(
      `Found ${cleanData.length} links. Batch ${batches.length} of ${batches.length}: Extracting IDs: Completed in ${timeTaken}`
    );

    // setTempAllLinks(justLinks);
    return;
    let accommodations = data
      .filter((x: any) => x[0] !== '')
      .map((item: any) => {
        return { id: 0, url: item[0], name: hotelNameExtractor(item[0]) };
      });

    setResult(`Extracting IDs: ${accommodations.length} found.`);
    setAccommodationList(accommodations);

    let counter = 0;
    while (counter < accommodations.length) {
      const currentAccommodation = accommodations[counter];
      const hotelIdRes = await fetch(`/api/autosuggest?name=${currentAccommodation.name}`);
      if (hotelIdRes.status === 200) {
        const hotelIdData = await hotelIdRes.json();
        if (hotelIdData.hotelId) {
          setResult(`Extracting IDs: ${((counter / accommodations.length) * 100).toFixed(0)}%`);

          accommodations[counter] = { ...currentAccommodation, id: hotelIdData.hotelId };
        } else {
          console.log(`${counter + 1}: Unable to find ID for ${currentAccommodation.name}`);
        }
      } else {
        console.log(`${counter + 1}: ERROR: Unable to find ID for ${currentAccommodation.name}`);
        console.log(hotelIdRes);
      }
      counter++;
    }
    setResult(`Extracting IDs: Complete.`);
    setAccommodationList([...accommodations]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-10 gap-4">
      <h1 className="text-xl">Extract Hotel ID from booking link</h1>
      <h1>Extract Hotel ID from a single Link</h1>
      <div className="flex flex-row w-full">
        <input
          type="text"
          className="text-black border border-black rounded-md w-full p-[5.5px]"
          placeholder="Insert link"
          value={currentlLink}
          onChange={(e) => setCurrentLink(e.target.value)}
        />
        <button
          className=" border border-black bg-blue-500 rounded-md w-1/4 p-[5.5px]"
          onClick={() => handleFind(currentlLink)}
        >
          Extract
        </button>
      </div>
      <h1>OR extract Hotel IDs from multiple links in CSV</h1>
      <div className="p-4 flex w-full rounded-md justify-center items-center border border-white">
        <CSVReader
          onFileLoaded={(data, fileInfo, originalFile) => {
            handleFileLoaded(data, fileInfo, originalFile);
          }}
        />
      </div>
      {result !== '' && <p>{result}</p>}
      <div className="flex flex-col gap-3">
        {accommodationList && (
          <table>
            <thead>
              <tr>
                <th className="p-2 border border-white">ID</th>
                <th className="p-2 border border-white">Name</th>
              </tr>
            </thead>
            <tbody>
              {accommodationList &&
                accommodationList.map((x: { id: number; name: string; url: string }, i: number) => (
                  <tr key={`tr_${i}`}>
                    <td className="p-2 border border-white">{x.id === 0 ? '-' : x.id}</td>
                    <td className="p-2 border border-white">{x.name}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/**
       * Temporary interface for POST endpoint
       * Temporary interface for POST endpoint
       * Temporary interface for POST endpoint
       */}
      <div className="border-2 border-dotted border-white p-4 rounded-md flex flex-col w-full">
        <h1>Temp POST endpoint interface</h1>
        <textarea
          className="text-black border border-black rounded-md p-2 w-full h-96"
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
        />
        <button
          className="border border-black bg-blue-500 rounded-md w-full"
          onClick={async () => {
            const result = await fetch('/api/availability', {
              method: 'POST',
              body: postBody.replace(/\s+/g, ''),
            });
            const data = await result.json();

            console.log(data);
            setPostResult(data);
          }}
        >
          Test POST endpoint
        </button>
        {postResult &&
          postResult.length > 0 &&
          postResult.map((x: any, i: number) => (
            <p key={`p_${i}`}>{`${x.id} => ${JSON.stringify(x.price)}`}</p>
          ))}
      </div>
      {/**
       * Temporary interface for POST endpoint
       * Temporary interface for POST endpoint
       * Temporary interface for POST endpoint
       */}

      <div className="border-2 border-dotted border-white p-4 rounded-md flex flex-col w-full">
        {tempAllLinks && tempAllLinks.length > 0 && (
          <div className="flex flex-col gap-3">
            {tempAllLinks.map((x, i) => (
              <a key={`link_${i}`} href={x} target="_blank">
                {x}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
