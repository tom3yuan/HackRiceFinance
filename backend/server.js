// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import { buildSimplePromptFromText } from './prompts/simplePrompt.js';
import { buildComplexPromptFromText } from "./prompts/complexPrompt.js";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: [ "http://localhost:5173", "http://168.5.149.113:5173" ]
}));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});


/*
Simple Extract
Goal: Extract company name, company code, short description etc. 
*/
app.post("/simple-extract", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const base64Data = req.file.buffer.toString('base64');
    const systemPrompt = buildSimplePromptFromText();

    const schema = {
      type: "OBJECT",
      properties: {
        Company_Info: {
          type: "OBJECT",
            properties: {
              Company_Name: { type: "STRING" },
              Company_Code: { type: "STRING" }
            },
            required: ["Company_Name", "Company_Code"]
          },
          Probability: {
            type: "OBJECT",
            properties: {
              Gain_Probability: { type: "STRING" },
              Neutral_Probability: { type: "STRING" },
              Loss_Probability: { type: "STRING" },
              Probability_Statement: { type: "STRING" }
            },
            required: ["Gain_Probability", "Neutral_Probability", "Loss_Probability", "Probability_Statement"]
          },
          Concise_5_Minute_Decision: { type: "STRING" }
        },
      required: ["Company_Info", "Probability", "Concise_5_Minute_Decision"]
    };

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "" },
              {
                inlineData: 
                {
                  mimeType: "application/pdf",
                  data: base64Data
                }
              }
            ]
          }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if(!response.ok) {
      const errorBody = await response.json();
      console.error("API error Response:", errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textContent) {
      res.status(200).json(textContent);
    } else {
      console.error("Unexpected API response structure:", result);
      throw new Error("Failed to get a valid response from the API.");
    }
  } catch (error) {
    console.error("Error in /simple-extract endpoint:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

app.post("/complex-extract", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }

    const base64Data = req.file.buffer.toString('base64');
    const systemPrompt = buildComplexPromptFromText();

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "" },
              {
                inlineData: 
                {
                  mimeType: "application/pdf",
                  data: base64Data
                }
              }
            ]
          }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
    }
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if(!response.ok) {
      const errorBody = await response.json();
      console.error("API error Response:", errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textContent) {
      res.status(200).json(textContent);
    } else {
      console.error("Unexpected API response structure:", result);
      throw new Error("Failed to get a valid response from the API.");
    }
  } catch (error) {
    console.error("Error in /simple-extract endpoint:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

app.post("/api/explain", async (req, res) => {
  try {
    const raw = (req.body?.text ?? "").toString().trim();
    if (!raw) return res.status(400).json({ error: "No text provided" });

    // Enforce server-side cap (mirrors front-end)
    const snippet = raw.slice(0, 1200);

    // Build a short deterministic prompt for explanations
    const systemPrompt = [
      "You explain selected snippets for non-experts.",
      "Rules:",
      "- Detect the snippet language and reply in that language.",
      "- 2–4 concise sentences; define jargon briefly if present.",
      "- Be neutral and avoid speculation.",
      "",
      `Snippet:\n"""${snippet}"""`,
    ].join("\n");

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 180
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => null);
      console.error("Explain API error:", response.status, errBody);
      return res.status(502).json({ error: "Upstream model request failed" });
    }

    const result = await response.json();
    const explanation = result.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!explanation) {
      console.error("Unexpected explain response:", result);
      return res.status(500).json({ error: "No explanation returned" });
    }

    return res.json({ explanation });
  } catch (err) {
    console.error("Error in /api/explain:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = 3001;
app.listen(port, () => console.log(`Backend running on port ${port}`));