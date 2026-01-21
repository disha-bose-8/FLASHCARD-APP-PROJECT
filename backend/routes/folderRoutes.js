import express from "express";
import Folder from "../models/folder.js";

const router = express.Router();

// Create folder
router.post("/create", async (req, res) => {
    const { userId, name } = req.body;

    try {
        const folder = await Folder.create({ name, userId, flashcards: [] });
        res.json({ message: "Folder created", folder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all folders for a user
router.get("/:userId", async (req, res) => {
    try {
        const folders = await Folder.find({ userId: req.params.userId });
        res.json(folders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete folder
router.delete("/:folderId", async (req, res) => {
    try {
        await Folder.findByIdAndDelete(req.params.folderId);
        res.json({ message: "Folder deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
