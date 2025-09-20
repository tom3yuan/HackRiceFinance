import { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import ResultsPage from '../pages/ResultsPage';
import ComplexResultsPage from '../pages/ComplexResultsPage';
import './GeneratorLayout.css';

function GeneratorLayout() {
  const location = useLocation();
  const extractedData = location.state?.extractedData;
  const file = location.state?.file;

  // --- FIX 1: Initialize the aiText state with the extractedData ---
  // The fallback text is for safety, but the redirect should prevent it from being seen.
  const [aiText, setAiText] = useState(extractedData || "Your generated content will appear here...");
  
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<'simple' | 'complex'>('simple');

  const handleViewSwitch = () => {
    setRightPanelView(currentView => currentView === 'simple' ? 'complex' : 'simple');
  };
  
  const handleGenerate = async (prompt: string) => {
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    setRightPanelView('simple'); 
    setIsLoading(true);
    setAiText("Generating...");

    try {
      const response = await fetch("http://168.5.149.113:3001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      const data = await response.json();
      setAiText(data.generatedText); 
    } catch (error) {
      console.error("Error fetching AI content:", error);
      setAiText("Failed to get response from AI. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!extractedData || !file) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="generator-container">
      <div className="left-panel">
        <HomePage 
          onGenerate={handleGenerate} 
          isLoading={isLoading}
          extractedData={extractedData}
          file={file}
        />
      </div>
      <div className="right-panel">
        {/* --- FIX 2: Use conditional rendering to show only one view at a time --- */}
        {rightPanelView === 'simple' ? (
          <ResultsPage 
            onSwitch={handleViewSwitch}
            aiText={aiText} // Pass the correct state variable
            isLoading={isLoading}
          />
        ) : (
          <ComplexResultsPage 
            onSwitch={handleViewSwitch} 
            aiText={aiText} // Pass the correct state variable
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default GeneratorLayout;