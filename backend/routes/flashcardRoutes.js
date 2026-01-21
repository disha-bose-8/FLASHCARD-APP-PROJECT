import express from "express";
import Folder from "../models/folder.js";

const router = express.Router();

// UPDATE FLASHCARD STATUS 
router.put("/status", async (req, res) => {
    try {
        const { folderId, index, status } = req.body;

        console.log("Updating flashcard status:", { folderId, index, status });

        // Find the folder
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ error: "Folder not found" });
        }

        // Check if the index is valid
        if (index < 0 || index >= folder.flashcards.length) {
            return res.status(404).json({ error: "Flashcard not found" });
        }

        // Convert "wrong" to "not-memorized" if needed
        const finalStatus = status === "wrong" ? "not-memorized" : status;
        
        // Update the status using the index
        folder.flashcards[index].status = finalStatus;
        await folder.save();

        console.log("Status updated successfully:", {
            question: folder.flashcards[index].question,
            status: folder.flashcards[index].status
        });

        res.json({ 
            message: "Status updated", 
            flashcard: folder.flashcards[index] 
        });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ error: "Failed to update status: " + err.message });
    }
});

// GET NOT-MEMORIZED CARDS 
router.get("/not-memorized/:userId", async (req, res) => {
    try {
        const folders = await Folder.find({ userId: req.params.userId });

        let notMemorized = [];

        folders.forEach((folder) => {
            folder.flashcards.forEach((card, index) => {
                // SHOW BOTH "not-memorized" AND "wrong" CARDS
                if (card.status === "not-memorized" || card.status === "wrong") {
                    notMemorized.push({
                        ...card.toObject(),
                        folderId: folder._id,
                        folderName: folder.name,
                        index: index
                    });
                }
            });
        });

        console.log(`Found ${notMemorized.length} not-memorized cards`);
        res.json(notMemorized);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch not memorized cards" });
    }
});


// Add Flashcard
router.post("/add", async (req, res) => {
    const { folderId, question, answer } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) return res.status(404).json({ error: "Folder not found" });

        folder.flashcards.push({ question, answer });
        await folder.save();

        res.json({ message: "Flashcard added", flashcards: folder.flashcards });
    } catch (err) {
        res.status(500).json({ error: "Error adding flashcard: " + err.message });
    }
});

// Update Flashcard by index
router.put("/update", async (req, res) => {
    const { folderId, index, question, answer } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) return res.status(404).json({ error: "Folder not found" });

        if (!folder.flashcards[index])
            return res.status(404).json({ error: "Flashcard not found" });

        folder.flashcards[index].question = question;
        folder.flashcards[index].answer = answer;
        await folder.save();

        res.json({ message: "Flashcard updated", flashcards: folder.flashcards });
    } catch (err) {
        res.status(500).json({ error: "Error updating flashcard: " + err.message });
    }
});

// Delete Flashcard by index
router.put("/delete", async (req, res) => {
    const { folderId, index } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) return res.status(404).json({ error: "Folder not found" });

        if (!folder.flashcards[index])
            return res.status(404).json({ error: "Flashcard not found" });

        folder.flashcards.splice(index, 1);
        await folder.save();

        res.json({ message: "Flashcard deleted", flashcards: folder.flashcards });
    } catch (err) {
        res.status(500).json({ error: "Error deleting flashcard: " + err.message });
    }
});

// Import flashcards from CSV
router.post("/import", async (req, res) => {
    const { folderId, cards } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) return res.status(404).json({ error: "Folder not found" });

        folder.flashcards.push(...cards);
        await folder.save();

        res.json({ message: `${cards.length} flashcards imported`, flashcards: folder.flashcards });
    } catch (err) {
        res.status(500).json({ error: "Error importing flashcards: " + err.message });
    }
});

export default router;