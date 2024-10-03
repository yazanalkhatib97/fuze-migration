import fs from "fs";
import { parse } from "csv-parse";
import { exportToCSV } from "./utils/exportCSV";

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
  const uScreen = (await readCSV(
    "./data/uscreen-active-users-edited.csv"
  )) as any;

  uScreen?.forEach((record) => {
    if (record.subscriptionPlan === "3 month challenge 🔥") result.push(record);
  });

  console.log({
    result: result.length,
  });

  const columns = {
    Id: "Id",
    name: "name",
    email: "email",
    subscriptionPlan: "subscriptionPlan",
  };

  exportToCSV(
    "./data/uscreen-active-3-monthly-challenge-users.csv",
    columns,
    result
  );
})();
