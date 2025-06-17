import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader, CheckCircle, XCircle } from 'lucide-react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://docsend-scraper-backend.onrender.com';

function App() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/scraper/presentations`);
      setPresentations(response.data);
    } catch (error) {
      console.error('Error fetching presentations:', error);
      setMessage('Error connecting to backend');
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post(`${API_BASE}/api/scraper/scrape`, { 
        url, 
        password 
      });
      
      setUrl('');
      setPassword('');
      setMessage('Scraping completed successfully!');
      fetchPresentations();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || 'Failed to scrape presentation'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'failed': return <XCircle className="text-red-500" size={16} />;
      case 'processing': return <Loader className="text-blue-500 animate-spin" size={16} />;
      default: return <Loader className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            DocSend Scraper
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Scrape New Presentation</h2>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleScrape} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DocSend URL
              </label>
              <input
                type="url"
                placeholder="https://docsend.com/view/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (if required)
              </label>
              <input
                type="password"
                placeholder="Leave blank if no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Scraping...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Scrape Presentation
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Scraped Presentations</h2>
          </div>
          
          <div className="divide-y">
            {presentations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No presentations scraped yet. Try adding a DocSend URL above!
              </div>
            ) : (
              presentations.map(presentation => (
  <div key={presentation._id} className="p-6 hover:bg-gray-50">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">
          {presentation.title || 'Untitled Presentation'}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {presentation.slideCount || 0} slides
        </p>
        
        {/* Show first slide content */}
        {presentation.slides && presentation.slides[0] && (
          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
            <strong>Preview:</strong>
            <p className="mt-1 text-gray-700">
              {presentation.slides[0].text.substring(0, 200)}
              {presentation.slides[0].text.length > 200 ? '...' : ''}
            </p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          {new Date(presentation.createdAt).toLocaleString()}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {getStatusIcon(presentation.status)}
        <span className="text-sm capitalize text-gray-600">
          {presentation.status}
        </span>
      </div>
    </div>
  </div>
))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;