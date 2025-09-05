import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DocSendScraper from './DocSendScraper';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scraper" element={<DocSendScraper />} />
      </Routes>
    </Router>
  );
}

export default App;