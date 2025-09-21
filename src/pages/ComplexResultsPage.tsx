import './ComplexResultsPage.css';
import React from "react";
import MarkdownViewer from './MarkdownViewer';   // ✅ use this one only

// ====================================================================
// SwitchViewButton
// ====================================================================
interface SwitchViewButtonProps {
  onSwitch: () => void;
}

alert("⚡ ComplexResultsPage ran!");
const SwitchViewButton: React.FC<SwitchViewButtonProps> = ({ onSwitch }) => {
  return (
    <div>
      <button
        onClick={onSwitch}
        className="switch-view-button"
        aria-label="Switch view"
      >
        Go to simple view {/* Arrow Icon */}
      </button>
    </div>
  );
};

// ====================================================================
// ComplexResultsPage
// ====================================================================
interface ComplexResultsPageProps {
  aiText: string;
  isLoading: boolean;
  onSwitch: () => void;
  goToPage: (pageNum: number) => void;
}

const ComplexResultsPage: React.FC<ComplexResultsPageProps> = ({
  aiText,
  isLoading,
  onSwitch,
  goToPage,
}) => {
  console.log("➡️ Passing props to MarkdownViewer", { aiText, isLoading });
  return (
    
    <div className="results-container">
      {/* ✅ This now correctly uses your imported MarkdownViewer */}
      
      <MarkdownViewer 
        aiText={aiText} 
        isLoading={isLoading} 
        goToPage={goToPage}
      />

      <SwitchViewButton onSwitch={onSwitch} />
    </div>
  );
};

export default ComplexResultsPage;