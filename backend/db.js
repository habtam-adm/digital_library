const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // XAMPP default = empty
  database: "library_db",
});

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

module.exports = db;
