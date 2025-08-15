import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import listingsRouter from "./routes/listing";


dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/listings", listingsRouter);


app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart_rent";

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Mongo connection failed:", err);
    process.exit(1);
  }
}

start();