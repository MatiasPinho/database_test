import express from "express";
import { router as productsRt } from "./src/routes/productsRt.js";

const PORT = process.env.PORT ?? 3000;
const app = express();
app.use(express.json());
app.listen(PORT, (err) => {
  err
    ? console.log("servidor no esta corriendo")
    : console.log(`servidor esta corriendo en localhost/${PORT} `);
});

app.use("/products", productsRt);
