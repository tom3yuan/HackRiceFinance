import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [aiText, setAiText] = useState("");
  // --- NEW: State variable to hold the text from the input box ---
  const [prompt, setPrompt] = useState("Put your prompt here");

  const handleClick = async () => {
    setCount((count) => count + 7);

    try {
      // --- MODIFIED: Changed to a POST request to send data ---
      const response = await fetch("http://localhost:3001/generate", {
        method: "POST", // We are sending data, so we use POST
        headers: {
          "Content-Type": "application/json", // Tell the server we're sending JSON
        },
        // Put the prompt from our state into the request body
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await response.json();
      console.log("AI response:", data.text);
      setAiText(data.text);
    } catch (error) {
      console.error("Error fetching AI content:", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>AI Content Generator</h1>
      
      {/* --- NEW: Text area for the user to type their prompt --- */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="prompt-input" style={{ display: "block", marginBottom: "0.5rem" }}>
          Enter your prompt:
        </label>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
        />
      </div>

      <button onClick={handleClick}>Generate AI Content</button>

      {aiText && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", whiteSpace: "pre-wrap" }}>
          <strong>AI says:</strong>
          <p>{aiText}</p>
        </div>
      )}
    </div>
  );
}

export default App;