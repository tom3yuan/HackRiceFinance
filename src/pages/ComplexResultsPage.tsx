import './ComplexResultsPage.css';
import React from "react";
import MarkdownViewer from './MarkdownViewer';   // ✅ use this one only
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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



  console.log("➡️ Passing props to MarkdownViewer", { aiText, isLoading });
  return (
    <div className="scroll-wrapper">

    <div id="results-to-pdf" className="results-container">      {/* ✅ This now correctly uses your imported MarkdownViewer */}
      <MarkdownViewer 
        aiText={aiText} 
        isLoading={isLoading} 
        goToPage={goToPage}
      />
      <div style={{ paddingBottom: '24.5px'}}>
  <button
  onClick={exportPDF}
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px 20px',
      borderRadius: '99999px',
      border: 'none',
      height: '35px',
      background: '#90C96E',
      color: '#1a202c',
      fontSize: '15px',
      cursor: 'pointer',
      fontFamily: "'Poppins', sans-serif",
      transition: 'background-color 0.3s, transform 0.3s',
    }}
  >
    Export as PDF
  </button>
</div>
      
      </div>
      <SwitchViewButton onSwitch={onSwitch} />
      
    </div>
    
  );
};

export default ComplexResultsPage;