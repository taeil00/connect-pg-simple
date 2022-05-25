const { Pool } = require("pg");
const pgPool = new Pool({
  user: "myuser",
  password: "mypass",
  host: "localhost",
  port: 5432,
  database: "fc21",
});

module.exports = pgPool;
