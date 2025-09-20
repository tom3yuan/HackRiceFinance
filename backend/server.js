import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();

// --- NEW: Add this middleware to parse JSON bodies ---
// This MUST come before your routes.
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://168.5.149.113:5173" // Keep this for your teammate
  ]
}));

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// --- MODIFIED: Changed from app.get to app.post ---
app.post("/generate", async (req, res) => {
  try {
    // --- NEW: Get the prompt from the request body sent by the frontend ---
    const { prompt } = req.body;

    // Add a check to make sure a prompt was sent
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- MODIFIED: Use the user's prompt instead of a hardcoded string ---
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ text: text });

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate content from AI." });
  }
});

const port = 3001;
app.listen(port, () => console.log(`Backend running on port ${port}`));