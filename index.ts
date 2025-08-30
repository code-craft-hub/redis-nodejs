import express from "express";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app
  .listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
  })
  .on("error", (error) => {
    console.error(error.message);
    throw new Error(error.message);
  });
