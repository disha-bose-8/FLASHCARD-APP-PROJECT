import mongoose from "mongoose";
import flashcardSchema from "./flashcard.js";

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flashcards: [flashcardSchema]
});

export default mongoose.model("Folder", folderSchema);
