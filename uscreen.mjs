import fs from "fs";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";

const readCSV = (filePath) => {
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

const result = [];

(async () => {
  const uScreen = await readCSV("./data/uscreen-active-users-edited.csv");

  uScreen.forEach((record) => {
    if (record.subscriptionPlan === "3 month challenge 🔥") result.push(record);
  });

  console.log({
    result: result.length,
  });

  const outputStream = fs.createWriteStream(
    "./data/uscreen-active-3-monthly-challenge-users.csv"
  );

  const columns = {
    Id: "Id",
    name: "name",
    email: "email",
    subscriptionPlan: "subscriptionPlan",
  };

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
})();
