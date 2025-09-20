// src/pages/LandingPage.tsx

import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // We will create this CSS file next

function LandingPage() {
  const navigate = useNavigate();

  // This function will be called when the button is clicked
  const handleStart = () => {
    // Navigate to your main prompt page. Make sure this route exists in App.tsx!
    navigate('/prompt'); 
  };

  return (
    <html>
      <head>
          <title>File Upload to Gemini</title>
      </head>
      <body>
        <div>
          <h2>Upload a PDF to Summarize</h2>
          <input type="file" id="fileInput" accept="application/pdf" />
          <button id="uploadButton">Summarize</button>
          <div id="summaryDiv"></div>

          <script src="server.js"></script>
        </div>
      </body>
    </html>
  );
}


export default LandingPage;