import fs from "fs";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { Sequelize, DataTypes, Op } from "sequelize";

const sequelize = new Sequelize("verceldb", "default", "UnNTsacBbd23", {
  host: "ep-billowing-hall-86514570-pooler.eu-central-1.aws.neon.tech",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    pool: {
      max: 20, // Maximum number of connections in the pool
      min: 0, // Minimum number of connections in the pool
      acquire: 600000, // The maximum time, in milliseconds, that pool will try to get a connection before throwing an error
      idle: 100000, // The maximum time, in milliseconds, that a connection can be idle before being released
    },
  },
});

// User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stytchId: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "User",
    schema: "public",
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    // const users = await User.findAll();
    const users = await User.findAll({
      where: {
        stytchId: {
          [Op.eq]: null, // 1. Get all Postgres Production DB users with StytchId
        },
      },
    });

    console.log("Connection has been established successfully.");

    const columns = {
      Id: "User ID",
      Username: "User name",
      email: "email",
      SubscriptionPlan: "SubscriptionPlan",
    };

    // Read the CSV file
    fs.readFile("./uscreen-active-users-edited.csv", "utf8", (err, data) => {
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

        // 2. Match the user with Uscreen records that have a subscriptionPlan

        const result = [];

        // * Important
        console.log(`Uscreen active users: ${records.length}`);
        records.forEach(async (record) => {
          if (users.find((user) => user.email === record.email))
            result.push(record);
        });

        console.log({ result, length: result.length });

        // records.forEach(async (record) => {
        //   if (
        //     users.find(
        //       (user) => user.email === record.email
        //       // user.email === record.email && record.subscriptionPlan !== null
        //     )
        //   )
        //     result.push(record);
        // });
      });
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Parse csv file and return data
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

// (async () => {
//   const postgresDbArr = await readCSV("output.csv");
//   const revenueCatArr = await readCSV("revenuecat-users.csv");
//   const result = [];

//   postgresDbArr.forEach((record) => {
//     if (revenueCatArr.find((rec) => rec.app_user_id === record.email))
//       result.push(record);
//   });

//   console.log({ result: result.length });
// })();
