// src/layouts/GeneratorLayout.tsx

import { useState } from 'react';
import HomePage from '../pages/HomePage';       // We will modify this file next
import ResultsPage from '../pages/ResultsPage'; // We will modify this file next
import './GeneratorLayout.css';                 // And create this CSS

function GeneratorLayout() {
  // --- STATE IS LIFTED UP TO THE PARENT ---
  // This layout component now owns the AI response and loading state.
  const [aiText, setAiText] = useState("Your generated content will appear here...");
  const [isLoading, setIsLoading] = useState(false);

  // --- API CALL LOGIC IS ALSO IN THE PARENT ---
  const handleGenerate = async (prompt: string) => {
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    setIsLoading(true);
    setAiText("Generating..."); // Show a generating message

    try {
      const response = await fetch("http://168.5.149.113:3001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      const data = await response.json();
      setAiText(data.text); // Update the state with the real response
    } catch (error) {
      console.error("Error fetching AI content:", error);
      setAiText("Failed to get response from AI. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <div className="left-panel">
        {/* Pass the handler function and loading state down to HomePage */}
        <HomePage onGenerate={handleGenerate} isLoading={isLoading} />
      </div>
      <div className="right-panel">
        {/* Pass the AI text and loading state down to ResultsPage */}
        <ResultsPage aiText={aiText} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default GeneratorLayout;