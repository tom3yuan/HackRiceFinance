import './ComplexResultsPage.css';
import React from "react";
import MarkdownViewer from './MarkdownViewer';

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
      &#x2192; {/* Arrow Icon */}
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
  console.log(aiText);
  return (
    <div className="results-container">
      {/* MarkdownViewer will handle parsing + page buttons */}
      <MarkdownViewer 
        aiText={aiText} 
        isLoading={isLoading} 
        goToPage={goToPage}
      />

      {/* Switch view button */}
      <SwitchViewButton onSwitch={onSwitch} />
    </div>
  );
};

export default ComplexResultsPage;