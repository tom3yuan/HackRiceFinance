import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ResultsPage.css';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ====================================================================
// SwitchViewButton component (no changes needed here)
// ====================================================================
interface SwitchViewButtonProps {
  onSwitch: () => void;
}
const SwitchViewButton: React.FC<SwitchViewButtonProps> = ({ onSwitch }) => {
  return (
    <div>


    <button
      onClick={onSwitch}
      className="switch-view-button"
      aria-label="Switch view"
    >
      Go to Complex View
    </button>
    </div>
  );
}

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
  const exportPDF = () => {
  const input = document.getElementById("results-to-pdf");
  if (!input) return;

  // Temporarily remove scroll
  const originalHeight = input.style.height;
  input.style.height = 'auto';

  html2canvas(input, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(canvas);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
      //const pageHeight = Math.min(heightLeft, pdfHeight);
      pdf.addImage(canvas, "PNG", 0, -position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      position += pdfHeight;
      if (heightLeft > 0) pdf.addPage();
    }

    pdf.save("results.pdf");

    // Restore original height
    input.style.height = originalHeight;
  });
};

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
    <div className="scroll-wrapper">
    <div id="results-to-pdf" className="results-container">

      

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
              <div>
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
      </div>
      <div>

      <SwitchViewButton onSwitch={onSwitch} />
      <button
  onClick={exportPDF}
  className="export-pdf-button"
  style={{
            padding: '10px 20px',
            borderRadius: '99999px',
            border: 'none',
            height: '35px',
            background: '#90C96E',
            color: '#1a202c',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Poppins', sans-serif",
            transition: 'background-color 0.3s, transform 0.3s',
            marginLeft: '50px',
          }}>
  Export as PDF
</button>
      </div>
      
    </div>
  );
}

export default ResultsPage;