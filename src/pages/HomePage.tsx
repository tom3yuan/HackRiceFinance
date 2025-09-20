import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface HomePageProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  extractedData: any;
  file: File;
}

function HomePage({ onGenerate, isLoading, extractedData, file }: HomePageProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [prompt, setPrompt] = useState("");

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleSubmit = () => {
    const fullPrompt = `Based on: ${JSON.stringify(extractedData)}, please do: ${prompt}`;
    onGenerate(fullPrompt);
  };

  return (
    <div style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 style={{ marginBottom: "10px" }}>Document Preview</h3>
      
      {/* 👇 scrollable PDF container */}
      <div 
        style={{ 
          flexGrow: 1,
          overflowY: "auto", 
          border: "1px solid #4A5568", 
          borderRadius: "8px", 
          padding: "10px",
          background: "#1A202C"
        }}
      >
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          loading="Loading PDF preview..."
          error="Failed to load PDF preview."
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={600} // you can set to container width dynamically
              renderTextLayer={false} // prevents overlayed raw text
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </div>

      <div className="prompt-section" style={{ marginTop: "20px" }}>
        <h3 style={{ marginBottom: "10px" }}>Your Prompt</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt"
          style={{
            width: "100%",
            minHeight: "100px",
            backgroundColor: "#2D3748",
            color: "#E2E8F0",
            border: "1px solid #4A5568",
            borderRadius: "8px",
            padding: "10px"
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{ marginTop: "10px" }}
        >
          {isLoading ? "Generating..." : "Generate Response"}
        </button>
      </div>
    </div>
  );
}

export default HomePage;