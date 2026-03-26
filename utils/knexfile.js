require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"), // only used locally
});

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DEV_DB_HOST,
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      port: process.env.DEV_DB_PORT || 3306,
    },
    pool: { min: 2, max: 10 },
    debug: false,
  },

  production: {
    client: "mysql2",
    connection: process.env.MYSQL_URL, // should be your Railway URL
    pool: { min: 2, max: 10 },
    debug: false,
  },
};
