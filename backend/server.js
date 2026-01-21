import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";



dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/folders", folderRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.get("/", (req, res) => {
  res.send("Flashcard Pro API is running 🚀");
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
