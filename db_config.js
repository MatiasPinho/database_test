import mysql from "mysql2/promise.js";
const dbConfig = {
  host: "localhost",
  user: "root",
  port: 3306,
  database: "products",
  password: process.env.DB_PASSWORD,
};
export const connection = await mysql.createConnection(dbConfig);
connection.connect((err) => {
  err ? console.error(err) : console.log("te conectaste capo");
});
