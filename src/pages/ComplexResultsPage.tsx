import React from 'react';
import { useNavigate } from 'react-router-dom';

// ====================================================================
// 1. Define the SwitchViewButton component separately and correctly.
// ====================================================================
interface SwitchViewButtonProps {
  onSwitch: () => void;
}
const SwitchViewButton: React.FC<SwitchViewButtonProps> = ({ onSwitch }) => {
  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    zIndex: 10,
    padding: '0.5rem 0.8rem',
    fontSize: '1.2rem',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s ease',
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.1)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1.0)';
  };

  

  return (
    <button
      onClick={onSwitch}
      style={buttonStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      aria-label="Switch view"
    >
      <>&#x2192;</> {/* Arrow Icon */}
    </button>
  );
};


// ====================================================================
// 2. Define the ResultsPage component that uses the button.
// ====================================================================
interface ComplexResultsPageProps {
  aiText: string;
  isLoading: boolean;
  onSwitch: () => void; // <-- Added onSwitch here
}

function ComplexResultsPage({ aiText, isLoading, onSwitch }: ComplexResultsPageProps) {
  const navigate = useNavigate();
  return (
    // This parent div needs `position: 'relative'` for the button's positioning to work correctly.
    <div style={{ position: 'relative', height: '100%' }}>
      <h2>Complex Results Goes Here</h2>
      <div style={{ marginTop: "1rem", padding: "1rem", whiteSpace: "pre-wrap", backgroundColor: '#f9f9f9', borderRadius: '8px', minHeight: '300px' }}>
        {/*isLoading ? <p>Loading...</p> : <p>{aiText}</p>*/}
      </div>

      {/* Use the SwitchViewButton component and pass the onSwitch prop to it */}
      <SwitchViewButton onSwitch={onSwitch} />
    </div>
  );
}

export default ComplexResultsPage;