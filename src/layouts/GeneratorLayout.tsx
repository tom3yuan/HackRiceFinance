import { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
import ResultsPage from '../pages/ResultsPage';
import ComplexResultsPage from '../pages/ComplexResultsPage';
import './GeneratorLayout.css';
import DataPage from '../pages/DataPage';

function GeneratorLayout() {
  const location = useLocation();
  const { extractedData, extractedLongData } = location.state || {};
  const initialFile = location.state?.file || location.state?.file1;
  const [file, _setFile] = useState<File | null>(() => initialFile);
  if (!extractedData || !file) {
    return <Navigate to="/" replace />;
  }

  // --- CORRECTED STATE INITIALIZATION ---
  // Convert the extractedData object into a readable string for display
  const initialText = JSON.stringify(extractedData, null, 2);
  const [goToPageFn, setGoToPageFn] = useState<(pageNum: number) => void>(() => () => {});
  const [_aiText, setAiText] = useState(initialText);
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<'simple' | 'complex'>('simple');
  const [leftPanelView, setLeftPanelView] = useState<'pdf' | 'visual'>('pdf');

  const handleViewSwitch = () => {
    setRightPanelView(currentView => currentView === 'simple' ? 'complex' : 'simple');
  };

  const handlePDFSwitch = () => {
    setLeftPanelView(currentView => currentView === 'pdf' ? 'visual' : 'pdf');
  };
  
  const handleGenerate = async (prompt: string) => {
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }

    setRightPanelView('simple'); 
    setLeftPanelView('pdf'); 
    setIsLoading(true);
    setAiText("Generating...");

    try {
      const response = await fetch("http://168.5.149.113:3001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Ensure the response from /generate is also a string
      setAiText(data.generatedText || "Response did not contain generatedText."); 
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
        {leftPanelView === 'pdf' ? (
          <HomePage 
          onGenerate={handleGenerate} 
          isLoading={isLoading}
          extractedData={extractedData}
          file={file}
          onReady={(fn) => setGoToPageFn(() => fn)}
          onSwitchtoPDF={handlePDFSwitch}
        />
        ) : (
          <DataPage
          onSwitchToPDF={handlePDFSwitch}
          />
        )}
        
      </div>
      
      <div className="right-panel">
        <h3 style={{ margin: 0, color: "black" }}>Summary</h3>

        {rightPanelView === 'simple' ? (
          <ResultsPage 
            onSwitch={handleViewSwitch}
            aiText={extractedData}
            isLoading={isLoading}
          />
        ) : (
          <ComplexResultsPage 
            onSwitch={handleViewSwitch} 
            aiText={extractedLongData}
            isLoading={isLoading}
            goToPage={goToPageFn}
          />
        )}
      </div>
    </div>
  );
}

export default GeneratorLayout;