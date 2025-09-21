import React from "react";
import ReactMarkdown from "react-markdown";
import { pageReferencePlugin } from "./pageReferencePlugin";

// ✅ Export the props so they’re usable elsewhere
export interface MarkdownViewerProps {
  aiText: string;
  isLoading: boolean;
  goToPage: (pageNum: number) => void;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ aiText, isLoading, goToPage }) => {
  console.log("👀 MarkdownViewer mounted. isLoading:", isLoading, "aiText:", aiText);

  if (isLoading) return <div>Loading...</div>;

  const renderPageButtons = (pageString: string) => {
    console.log("🔗 renderPageButtons input:", pageString);

    const pageNumbers = pageString
      .replace(/Page\s*/g, "")
      .split(",")
      .map((s) => s.trim());

    console.log("➡️ Parsed pageNumbers:", pageNumbers);

    return pageNumbers.map((numStr, i) => (
      <button
        key={i}
        onClick={() => {
          console.log("🖱️ Go to page clicked:", numStr);
          goToPage(Number(numStr));
        }}
        style={{ margin: '0 2px' }}
      >
        {`Page ${numStr}`}
      </button>
    ));
  };

  return (
    <ReactMarkdown
      remarkPlugins={[pageReferencePlugin]}
      components={{
        pageReference: ({ node }: any) => {
          console.log("🎨 Rendering pageReference node:", node);
          return <>{renderPageButtons(node.value)}</>;
        },
      }}
    >
      {aiText}
    </ReactMarkdown>
  );
};

export default MarkdownViewer;