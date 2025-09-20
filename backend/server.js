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
const handleUpload = async () => {
    const fileInput = document.getElementById('fileInput');
    const summaryDiv = document.getElementById('summary');
    const file = fileInput?.files?.[0];

    if (!file || !summaryDiv) {
        alert("Please select a file first!");
        return;
    }

    summaryDiv.textContent = "Uploading and processing...";

    try {
        // This assumes the fileToBase64 helper function is defined elsewhere in your component
        const base64String = await fileToBase64(file);
        const justTheData = base64String.split(',')[1];

        const payload = {
            mimeType: file.type,
            data: justTheData
        };

        // Call your backend API endpoint
        const response = await fetch('http://localhost:3000/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // Get more detailed error from backend if available
            const errorBody = await response.json();
            throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        summaryDiv.textContent = result.summary;

    } catch (error) {
        console.error("Error during upload:", error);
        summaryDiv.textContent = `Failed to get summary: ${error.message}`;
    }
};

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