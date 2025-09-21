import './ComplexResultsPage.css';
import React from "react";
import MarkdownViewer from './MarkdownViewer';   // ✅ use this one only

// ====================================================================
// SwitchViewButton
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
        Go to Simple View {/* Arrow Icon */}
      </button>
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
    <div className="scroll-wrapper">

    <div className="results-container">
      {/* ✅ This now correctly uses your imported MarkdownViewer */}
      <MarkdownViewer 
        aiText={aiText} 
        isLoading={isLoading} 
        goToPage={goToPage}
      />
      </div>
      <SwitchViewButton onSwitch={onSwitch} />
    </div>
  );
};

export default ComplexResultsPage;