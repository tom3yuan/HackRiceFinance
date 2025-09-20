// src/pages/ResultsPage.tsx

// Define the types for the props we're receiving
interface ResultsPageProps {
  aiText: string;
  isLoading: boolean;
}

function ResultsPage({ aiText, isLoading }: ResultsPageProps) {
  // This component no longer needs useLocation or Link
  return (
    <div>
      <h2>Generated Content</h2>
      <div style={{ marginTop: "1rem", padding: "1rem", whiteSpace: "pre-wrap", backgroundColor: '#f9f9f9', borderRadius: '8px', minHeight: '300px' }}>
        {/* Show a loading indicator or the text */}
        {isLoading ? <p>Loading...</p> : <p>{aiText}</p>}
      </div>
    </div>
  );
}

export default ResultsPage;