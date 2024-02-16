import express from "express";
import cors from "cors";
import creatureRoute from "./routes/creatureRoute.js";
import cultureRoute from "./routes/cultureRoute.js";
import eventRoute from "./routes/eventRoute.js";
import userRoute from "./routes/userRoute.js";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { requireAuth } from "./lib/helpers.js";
dotenv.config();
const { MONGO_URI } = process.env;
const PORT = process.env.PORT || 3000;

const app = express();

//middlewares
app.use(morgan("dev"));
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

//user routes
app.use("/user", userRoute);

//middleware authorization
app.use(requireAuth());

//routes
app.use("/creatures", creatureRoute);
app.use("/cultures", cultureRoute);
app.use("/events", eventRoute);

//connection to Mongo and activate server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to Mongo successfully");
    app.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });

export default app;
