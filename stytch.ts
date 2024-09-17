const stytch = require("stytch");
const fs = require("fs");
import { parse } from "csv-parse";

const { stringify } = require("csv-stringify");

const client = new stytch.Client({
  project_id: "project-live-cfed3b4d-e47a-49d1-9652-3812cde51f74",
  secret: "secret-live-7FcqPeSLBPDLRKvhNMk00D0PZce3lixqYi4=",
  env: stytch.envs.live,
});

const result = [];
async function fetchAllUsers(cursor = null) {
  const params = {
    limit: 800,
    cursor: cursor,
  };

  try {
    const response = await client.users.search(params);
    result.push(...response.results);

    // Check if there is a next cursor
    if (response.results_metadata.next_cursor) {
      // Recursively fetch the next page of results
      await fetchAllUsers(response.results_metadata.next_cursor);
    }

    return result;
  } catch (err) {
    console.error(`Error fetching users: ${err}`);
  }
}

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

(async () => {
  const stytch = await fetchAllUsers();
  // console.log({ result: stytch });
  const uScreen: any = await readCSV(
    "./data/uscreen-active-web-users-6-months-plan.csv"
  );

  // console.log({ uScreen });
  const match = [];

  const unmatched = uScreen.filter((rec) => {
    // Check if there is no matching email in stytch
    const match = stytch.find((record) => record.emails[0].email === rec.email);
    return !match; // Return true if no match is found
  });

  console.log("Unmatched records:", unmatched.length);

  const outputStream = fs.createWriteStream("./data/output.csv");

  const columns = {
    Id: "Id",
    name: "name",
    email: "email",
    subscriptionPlan: "subscriptionPlan",
  };

  // Stringify the data
  stringify(
    unmatched,
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
