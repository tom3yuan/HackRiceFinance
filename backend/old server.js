// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: [ "http://localhost:5173", "http://168.5.149.113:5173" ]
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/extract", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const textToAnalyze = req.file.buffer.toString("utf-8");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Extract the key information from the following text.
      Respond ONLY with a valid JSON object and nothing else.
      Do not include markdown fences like \`\`\`json, introductory text, or explanations.
      The text is:
      """
      ${textToAnalyze}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    console.log("AI Raw Response Text:", rawText);

    // --- CHANGE 1: Cleaned up JSON parsing ---
    // Instead of manually finding brackets, we'll try to parse it directly.
    // This is more robust and will throw an error if the AI's response
    // is not a perfectly formatted JSON string.
    try {
      const parsedJson = JSON.parse(rawText);
      res.json(parsedJson); // Send the parsed JSON object
    } catch (parseError) {
      // This catch block runs if JSON.parse fails.
      console.error("Failed to parse AI response as JSON:", parseError);
      // We send the raw text to the frontend so the user can see what the AI returned.
      res.status(200).send(rawText);
    }

  } catch (error) {
    // --- CHANGE 2: Improved Error Logging ---
    console.error("Error in /extract endpoint:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});



app.post("/generate", async (req, res) => {
    // ... your existing /generate code
});

const port = 3001;
app.listen(port, () => console.log(`Backend running on port ${port}`));