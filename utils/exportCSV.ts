import fs from "fs";
import { stringify } from "csv-stringify";
import { parse } from "csv-parse";

export const exportToCSV = (destination, columns, result) => {
  const outputStream = fs.createWriteStream(destination);

  // Stringify the data
  stringify(
    result,
    {
      header: true, // Include header row
      columns: columns, // Use defined columns for order and header names
    },
    (err, output) => {
      if (err) {
        console.error("Error stringifying data:", err);
        return;
      }
      // Write the CSV content to the file
      outputStream.write(output);
      outputStream.end();
    }
  );
};

// Parse csv file and return data
export const readCSV = (filePath) => {
  return new Promise((resolve) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading the file: ${err.message}`);
        return;
      }

      // Parse the CSV data
      parse(data, { columns: true }, (err, records) => {
        if (err) {
          console.error(`Error parsing CSV data: ${err.message}`);
          return;
        }

        resolve(records);
      });
    });
  });
};
