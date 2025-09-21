import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import DataPage from "./DataPage"; // Import DataPage for toggling

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface HomePageProps {
    onGenerate: (prompt: string) => void;
    onReady?: (goToPage: (pageNum: number) => void) => void; // external hook to control page scroll
    isLoading: boolean;
    extractedData: any;
    onSwitchtoPDF: () => void;
    file: File;
}

function HomePage({ extractedData, file, onReady, onSwitchtoPDF }: HomePageProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(600);
    const [showDataPage, setShowDataPage] = useState<boolean>(false); // State to toggle pages
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<HTMLDivElement[]>([]);

    // Function to scroll to a specific page
    const goToPage = useCallback((pageNum: number) => {
        const pageEl = pageRefs.current[pageNum - 1];
        if (pageEl) {
            pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    // Expose goToPage to parent via onReady
    useEffect(() => {
        if (onReady) {
            onReady(goToPage);
        }
    }, [onReady, numPages, goToPage]);

    // Handle container resize for responsive PDF scaling
    useEffect(() => {
        function handleResize() {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        pageRefs.current = new Array(numPages); // reset refs array
    };

    // Persist parsed data so DataPage can pick it up as a fallback
    useEffect(() => {
        if (extractedData) {
            try {
                localStorage.setItem('parsedData', JSON.stringify(extractedData));
            } catch {}
        }
    }, [extractedData]);

    // When switching to the DataPage view, pass the extracted company code directly
    if (showDataPage) {
        return (
            <DataPage
                onSwitchToPDF={() => setShowDataPage(false)}
                companyCode={extractedData?.Company_Info?.Company_Code}
            />
        ); // Render DataPage
    }

    return (
        <div className="animation">
        <div 
            style={{
                padding: "0px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                background: "transparent",
                color: "white"
            }}
        >
            <div style={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: "16px" // optional spacing between items
}}>
    
    <h3 style={{ margin: 0, color: "black" }}>Document Preview</h3>

    <button
        onClick={onSwitchtoPDF}
        style={{
    padding: "10px 20px",
    borderRadius: "99999px",
    border: "none",
    height: "35px",
    background: "#90C96E",
    color: "#000000ff",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
    transition: "background-color 0.3s, transform 0.2s",
  }}
  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.9)")}
  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
        Go to Data Visualization
    </button>
</div>
            {/* Scrollable PDF Preview */}
            <div
                ref={containerRef}
                style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    border: "1px solid #4A5568",
                    borderRadius: "5px",
                    padding: "10px",
                    background: "transparent",
                    height: "85vh"
                }}
            >
                <Document
                    file={file}
                    onLoadSuccess={handleLoadSuccess}
                    loading={
                        <div style={{ textAlign: "center", color: "white" }}>⌛ Loading PDF...</div>
                    }
                    error={
                        <div style={{ textAlign: "center", color: "red" }}>
                            ⚠️ Failed to load PDF preview
                        </div>
                    }
                >
                    {Array.from(new Array(numPages), (_, index) => (
                        <div
                            key={`page_${index + 1}`}
                            ref={(el) => {
                                if (el) pageRefs.current[index] = el;
                            }}
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "10px"
                            }}
                        >
                            <div
                                style={{
                                    background: "#1A202C",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                                }}
                            >
                                <Page
                                    pageNumber={index + 1} // ✅ Render each actual page (not only current pageNumber)
                                    width={containerWidth - 60}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        </div>
                    ))}
                </Document>
            </div>
        </div>
        </div>
    );
}

export default HomePage;