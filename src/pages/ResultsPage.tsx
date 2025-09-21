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
      Go to complex view {/* Arrow Icon */}
    </button>
  );
};

// ====================================================================
// Updated ResultsPage component
// ====================================================================
interface ResultsPageProps {
  aiText: string;
  isLoading: boolean;
  onSwitch: () => void;
}

function ResultsPage({ onSwitch, isLoading, aiText }: ResultsPageProps) {
  const location = useLocation();

  const [parsedData, setParsedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (aiText) {
        const data = JSON.parse(aiText);
        setParsedData(data);
        setError(null);
      }
    } catch (err) {
      setError("Could not parse AI response.");
      setParsedData(null);
    }
  }, [aiText, location.state]);

  return (
    <div className="results-container">
      <div className="results-content">
        <h2 className="results-title">RESULTS</h2>

        {isLoading ? (
          <p>Loading results...</p>
        ) : error ? (
          <textarea
            className="text-editor"
            value={aiText}
            rows={20}
            placeholder="Extracted text will appear here..."
          />
        ) : parsedData ? (
          <div className="results-pretty">
            <section>
              <h3>📊 Company Information</h3>
              <p><strong>Name:</strong> {parsedData.Company_Info?.Company_Name || "N/A"}</p>
              <p><strong>Code:</strong> {parsedData.Company_Info?.Company_Code || "N/A"}</p>
            </section>

            <section>
              <h3>🎯 Probability of Gain or Loss</h3>
              <div className="probability-cards">
                {/* Gain */}
                <div className="probability-card gain">
                  <h4>Gain</h4>
                  <p>{parsedData.Probability?.Gain_Probability || "N/A"}</p>
                </div>

                {/* Neutral */}
                <div className="probability-card neutral">
                  <h4>Neutral</h4>
                  <p>{parsedData.Probability?.Neutral_Probability || "N/A"}</p>
                </div>

                {/* Loss */}
                <div className="probability-card loss">
                  <h4>Loss</h4>
                  <p>{parsedData.Probability?.Loss_Probability || "N/A"}</p>
                </div>
              </div>
              <p><strong>Statement:</strong> {parsedData.Probability?.Probability_Statement}</p>
            </section>

            <section>
              <h3>📝 5-Minute Decision Abstract</h3>
              <p>{parsedData.Concise_5_Minute_Decision}</p>
            </section>
          </div>
        ) : (
          <p>No results available.</p>
        )}
      </div>

      <SwitchViewButton onSwitch={onSwitch} />
    </div>
  );
}

export default ResultsPage;