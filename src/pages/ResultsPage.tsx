import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ResultsPage.css';

// ====================================================================
// SwitchViewButton component (no changes needed here)
// ====================================================================
interface SwitchViewButtonProps {
  onSwitch: () => void;
}
const SwitchViewButton: React.FC<SwitchViewButtonProps> = ({ onSwitch }) => {
  return (
    <button
      onClick={onSwitch}
      className="switch-view-button"
      aria-label="Switch view"
    >
      <>&#x2192;</> {/* Arrow Icon */}
    </button>
  );
};

// ====================================================================
// Updated and Fixed ResultsPage component
// ====================================================================
interface ResultsPageProps {
  onSwitch: () => void; // <-- Added onSwitch here
}

function ResultsPage({ onSwitch }: ResultsPageProps) {
  // 1. Get the location object to access the passed state
  const location = useLocation();

  // 2. Create state to manage the textarea's content
  const [textContent, setTextContent] = useState('');

  // 3. Safely set the state when the component loads
  useEffect(() => {
    // Check if state and the specific data exist to prevent errors
    if (location.state && location.state.extractedData) {
      setTextContent(location.state.extractedData);
    }
  }, [location.state]); // This runs when the component mounts

  return (
    <div className="results-container">
      <div className="results-content">
        <h2 className="results-title">Extracted Content</h2>
        {/* 4. The textarea is now a controlled component linked to our state */}
        <textarea
          className="text-editor"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          rows={20}
          placeholder="Extracted text will appear here..."
        />
      </div>
      <SwitchViewButton onSwitch={onSwitch} />
    </div>
  );
}

export default ResultsPage;