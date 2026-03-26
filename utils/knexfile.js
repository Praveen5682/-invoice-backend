require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

// module.exports = {
//   development: {
//     client: "mysql2",
//     connection: {
//       host: process.env.DEV_DB_HOST,
//       user: process.env.DEV_DB_USER,
//       password: process.env.DEV_DB_PASSWORD,
//       database: process.env.DEV_DB_NAME,
//     },
//     pool: { min: 2, max: 10 },
//     debug: false,
//   },

//   production: {
//     client: "mysql2",
//     connection: {
//       host: process.env.PROD_DB_HOST,
//       user: process.env.PROD_DB_USER,
//       password: process.env.PROD_DB_PASSWORD,
//       database: process.env.PROD_DB_NAME,
//     },
//     pool: { min: 2, max: 10 },
//     debug: false,
//   },
// };

// console.log("🔥", process.env.DEV_DB_USER);

module.exports = {
  client: "mysql2",
  connection: process.env.MYSQL_URL,
  pool: { min: 2, max: 10 },
  debug: false,
};
