// src/pages/StartPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload'; // Make sure this path is correct
import './LandingPage.css'; // You can reuse your landing page styles

function StartPage() {
  // 1. Get the navigate function from the hook
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze the document.');
      }

      const extractedData = await response.json();

      // 2. Navigate to '/app' and pass the data in the `state` object
      navigate('/app', { state: { extractedData: extractedData, file: file } });

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); // Make sure to stop loading on error
    }
    // Don't set isLoading to false on success, as the page will navigate away
  };

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        <h1 className="landing-title">Analyze Your Document</h1>
        <p className="landing-subtitle">Upload a document to get started.</p>
        <div className="uploader-section">
          {isLoading ? (
            <div className="loading-indicator">Analyzing your document...</div>
          ) : (
            <FileUpload 
              onFileSelect={handleFileSelected} 
              accept=".pdf,.txt,.md,.json"
            />
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default StartPage;