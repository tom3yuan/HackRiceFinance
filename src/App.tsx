// App.tsx

import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import your new pages
import ResultsPage from './pages/ResultsPage';
import StartPage from './pages/StartPage';
import TestPage from './pages/TestPage';
import GeneratorLayout from './layouts/GeneratorLayout';

function App() {
  return (
    // This is the router's "switchboard"
    <Routes>
      {/* When the URL is "/", show the HomePage component */}
      <Route path="/" element={<StartPage/>}/>
      <Route path="/prompt" element={<HomePage />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/app" element={<GeneratorLayout />} />
      {/* When the URL is "/results", show the ResultsPage component */}
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}

export default App;