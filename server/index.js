import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./MongoDB/connect.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();
connectDB();

const app = express(); // ✅ app FIRST

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);


