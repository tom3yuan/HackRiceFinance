import React from "react";
import ReactMarkdown from "react-markdown";
import { pageReferencePlugin } from "./pageReferencePlugin";
import { rehypePageReference } from "./rehypePageReference";

// ✅ Export the props so they’re usable elsewhere
export interface MarkdownViewerProps {
    aiText: string;
    isLoading: boolean;
    goToPage: (pageNum: number) => void;
}

function extractFirstPage(val: string): number | null {
    const cleaned = val.replace(/Page\s*/i, "").trim();

    // Take the first comma segment
    const firstSegment = cleaned.split(",")[0].trim();

    // Take the first part of that if it’s a dash-separated range
    const firstPart = firstSegment.split("-")[0].trim();

    const pageNum = parseInt(firstPart, 10);

    return isNaN(pageNum) ? null : pageNum;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ aiText, isLoading, goToPage }) => {
    console.log("👀 MarkdownViewer mounted. isLoading:", isLoading, "aiText:", aiText);

    if (isLoading) return <div>Loading...</div>;

    const components = {
        pageReference: ({ node, children, ...props }: any) => {
            console.log("🎨 Rendering <pageReference>", { node, props, children });
            return (
                <button
                    onClick={() => {
                        const val = (props.value || node.properties?.value || "") as string;
                        const pageNum = extractFirstPage(val);
                        console.log("🖱️ Go to page clicked:", pageNum);
                        if (pageNum !== null) {
                            goToPage(pageNum);
                        }
                    }}
                    style={{
                        display: "inline-block",
                        verticalAlign: "middle", // 👈 aligns to middle of surrounding text
                        backgroundColor: "#90C96E",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 500,
                        border: "none",
                        cursor: "pointer",
                        margin: "0 4px"
                    }}
                >
                    Go to {props.value || node.properties?.value}
                </button>
            );
        }
    };
    return (
        <ReactMarkdown
            remarkPlugins={[pageReferencePlugin]}
            // 👇 Keep this so rehype doesn’t drop unknown nodes
            remarkRehypeOptions={{
                passThrough: ["pageReference"],
            }}
            rehypePlugins={[rehypePageReference]} // 👈 log the HAST
            components={components as any}
        >
            {aiText}
        </ReactMarkdown>
    );
};

export default MarkdownViewer;