import fs from "fs";
import { stringify } from "csv-stringify";

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
