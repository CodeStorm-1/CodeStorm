import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rideRoutes from "./routes/rideRoutes.js";
import cors from "cors";
import connectDb from "./config/db.js";

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const port = 3000;

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/rides", rideRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, "0.0.0.0", () => {
  connectDb();
  console.log(`Server running at http://localhost:${port}`);
});
