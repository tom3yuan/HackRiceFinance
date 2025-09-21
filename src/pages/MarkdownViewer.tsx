import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownViewerProps {
  aiText: string;
  isLoading: boolean;
  goToPage: (pageNum: number) => void;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ aiText, isLoading, goToPage }) => {
  if (isLoading) return <div>Loading...</div>;

  // -------------------------------------------------
  // Replace [Page ...] with {{Page ...}} placeholders
  // -------------------------------------------------
  const transformed = aiText.replace(/(Page[^]+)\]/g, (_, inside) => {
    return `{{${inside}}}`;
  });

  // -------------------------------------------------
  // Render buttons for page references
  // Handles: Page 3, Page 2-4, Page 1, 5, 7
  // -------------------------------------------------
  const renderPageButtons = (inside: string) => {
    return inside.split(",").map((part, i) => {
      const trimmed = part.trim();

      // Normalize: ensure "Page " prefix
      const normalized = trimmed.startsWith("Page") ? trimmed : `Page ${trimmed}`;

      // --- Handle range: "Page 2-5"
      const rangeMatch = normalized.match(/^Page\s+(\d+)-(\d+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        return (
          <React.Fragment key={i}>
            {Array.from({ length: end - start + 1 }, (_, j) => {
              const page = start + j;
              return (
                <button 
                  key={`${i}-${page}`} 
                  onClick={() => goToPage(page)} 
                  style={{ margin: "0 4px" }}
                >
                  Page {page}
                </button>
              );
            })}
          </React.Fragment>
        );
      }

      // --- Handle single page: "Page 7"
      const singleMatch = normalized.match(/^Page\s+(\d+)$/);
      if (singleMatch) {
        const page = parseInt(singleMatch[1], 10);
        return (
          <button 
            key={i} 
            onClick={() => goToPage(page)} 
            style={{ margin: "0 4px" }}
          >
            Page {page}
          </button>
        );
      }

      // --- Fallback (just render text if malformed)
      return <span key={i}>{trimmed}</span>;
    });
  };

  // -------------------------------------------------
  // Use ReactMarkdown with custom text renderer
  // -------------------------------------------------
  return (
    <ReactMarkdown
      components={{
        p: ({ node, children }) => <p>{children}</p>,
        text: ({ node, children }) => {
          const raw = children.join(""); // handle raw text
          if (raw.includes("{{")) {
            const parts = raw.split(/(\{\{.*?\}\})/g);
            return (
              <>
                {parts.map((p, i) => {
                  const m = p.match(/^\{\{(.+)\}\}$/);
                  if (m) {
                    // Insert buttons instead of text
                    return <React.Fragment key={i}>{renderPageButtons(m[1])}</React.Fragment>;
                  }
                  return <React.Fragment key={i}>{p}</React.Fragment>;
                })}
              </>
            );
          }
          return <>{children}</>;
        }
      }}
    >
      {transformed}
    </ReactMarkdown>
  );
};

export default MarkdownViewer;