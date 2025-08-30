import "dotenv/config";
import express from "express";
import { restaurantRouter } from "./routes/restaurants";
import { cuisinesRouter } from "./routes/cuisines";
import { errorHandler } from "./middleware/errorHandler";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/restaurants", restaurantRouter);
app.use("/cuisines", cuisinesRouter);

app.use(errorHandler);
app
  .listen(PORT, () => {
    console.log(`Application running on port ${PORT}`);
  })
  .on("error", (error) => {
    console.error(error.message);
    throw new Error(error.message);
  });
