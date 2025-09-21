// src/pages/StartPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure this path is correct
import './MasterCSS.css'
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
      const simple_response = await fetch('http://localhost:3001/simple-extract', {
        method: 'POST',
        body: formData,
      });
      const complex_response = await fetch('http://localhost:3001/complex-extract', {
        method: 'POST',
        body: formData,

      });
      // 2. Navigate to '/app' and pass the data in the `state` object

      if (!simple_response.ok) {
        const errData = await simple_response.json();
        throw new Error(errData.error || 'Failed to analyze the document.');
      }
      if (!complex_response.ok) {
        const errData = await complex_response.json();
        throw new Error(errData.error || 'Failed to analyze the document.');
      }


      const extractedData = await simple_response.json();
      console.log(extractedData);

      const extractedLongData = await complex_response.json();
      console.log(extractedLongData);

      // 2. Navigate to '/app' and pass the data in the `state` object
      navigate('/app', { 
        state: { 
          extractedData: extractedData, 
          extractedLongData: extractedLongData, 
          file: file 
        } 
      });


    } catch (err: any) {
      setError(err.message);
      setIsLoading(false); // Make sure to stop loading on error
    }

    

   
    // Don't set isLoading to false on success, as the page will navigate away
  };

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        <h1 className="landing-title">Invest in Your Future</h1>
        <p className="landing-subtitle">Upload a 10-K report to get started.</p>

        <div className="uploader-section">
          {isLoading ? (
            <div className="loading-bar-container">
            <div className="loading-bar"></div>
            </div>
          ) : (
            <>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="file-input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelected(file);
                  }
                }}
              />
              <label htmlFor="file-upload" className="upload-button">
                Select PDF
              </label>
            </>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default StartPage;