// App.tsx

import { Routes, Route } from 'react-router-dom';
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

    </Routes>
  );
}

export default App;