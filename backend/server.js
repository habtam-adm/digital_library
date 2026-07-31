const app = require("./src/app");
const env = require("./src/config/env");
const { pool } = require("./src/config/db");

async function start() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log(`Connected to MySQL database "${env.db.database}"`);
  } catch (err) {
    console.error("Could not connect to MySQL:", err.message);
    console.error("Start MySQL (XAMPP) and run: npm run db:setup");
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Wolkite University Digital Library API on http://localhost:${env.port}`);
  });
}

start();
