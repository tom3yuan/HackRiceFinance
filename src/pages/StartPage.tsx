// src/pages/LandingPage.tsx

import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // We will create this CSS file next

function LandingPage() {
  const navigate = useNavigate();

  // This function will be called when the button is clicked
  const handleStart = () => {
    // Navigate to your main prompt page. Make sure this route exists in App.tsx!
    navigate('/app'); 
  };

  return (
    <div className="landing-container">
      <div className="content-wrapper">
        <h1 className="landing-title">
          I love AI
        </h1>
        <button className="start-button" onClick={handleStart}>
          Start
        </button>
      </div>
    </div>
  );
}

export default LandingPage;