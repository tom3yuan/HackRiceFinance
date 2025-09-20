// App.tsx

import { Routes, Route } from 'react-router-dom';
import ResultsPage from './pages/ResultsPage';
import ComplexResultsPage from './pages/ComplexResultsPage'
import StartPage from './pages/StartPage';
import GeneratorLayout from './layouts/GeneratorLayout';

function App() {
  return (
    // This is the router's "switchboard"
    <Routes>
      {/* When the URL is "/", show the HomePage component */}
      <Route path="/" element={<StartPage/>}/>
      <Route path="/app" element={<GeneratorLayout />} />
      {/* When the URL is "/results", show the ResultsPage component */}
      <Route path="/results" element={<ResultsPage/>} />
      <Route path="/complexResults" element={<ComplexResultsPage/>} />
    </Routes>
  );
}

export default App;