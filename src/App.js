import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader, CheckCircle, XCircle, Eye, Download, Search } from 'lucide-react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://docsend-scraper-backend.onrender.com';

function App() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handlePDFConvert = async () => {
    if (!url) return;

    setLoading(true);
    setMessage('');
    
    try {
      setMessage('Converting DocSend to PDF... This process can take 1-3 minutes. Please wait...');
      
      const response = await axios({
        method: 'POST',
        url: `${API_BASE}/api/pdf/convert`,
        data: { url }, // Remove passcode since we're not using it
        responseType: 'blob',
        timeout: 240000 // 4 minute timeout for the whole process
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const urlObj = new URL(url);
      const docId = urlObj.pathname.split('/').pop() || 'document';
      link.download = `docsend-${docId}-${Date.now()}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      setUrl('');
      setPassword('');
      setMessage('PDF downloaded successfully! Check your downloads folder.');
    } catch (error) {
      console.error('PDF conversion error:', error);
      if (error.code === 'ECONNABORTED') {
        setMessage('Error: PDF conversion is taking longer than expected. The document may be very large. Please try again.');
      } else {
        setMessage('Error: ' + (error.response?.data?.error || 'PDF conversion failed. Please try again.'));
      }
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

  const downloadAsJSON = (presentation) => {
    const dataStr = JSON.stringify(presentation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${presentation.title || 'presentation'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const downloadAsText = (presentation) => {
    const textContent = presentation.slides?.map(slide => 
      `Slide ${slide.slideNumber}:\n${slide.text}\n\n`
    ).join('') || 'No content available';
    
    const dataStr = `Title: ${presentation.title}\nExtracted: ${new Date(presentation.extractedAt).toLocaleString()}\n\n${textContent}`;
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${presentation.title || 'presentation'}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredPresentations = presentations.filter(presentation =>
    presentation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    presentation.slides?.some(slide => 
      slide.text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (selectedPresentation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600" />
                {selectedPresentation.title || 'Untitled Presentation'}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadAsText(selectedPresentation)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download TXT
                </button>
                <button
                  onClick={() => downloadAsJSON(selectedPresentation)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download JSON
                </button>
                <button
                  onClick={() => setSelectedPresentation(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  ← Back to List
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Slides:</strong> {selectedPresentation.slideCount || 0}
              </div>
              <div>
                <strong>Extracted:</strong> {new Date(selectedPresentation.extractedAt).toLocaleString()}
              </div>
              <div>
                <strong>Method:</strong> {selectedPresentation.scrapingMethod || 'Standard'}
              </div>
            </div>
          </div>

          {selectedPresentation.slides?.map((slide, index) => (
            <div key={index} className="bg-white rounded-lg shadow mb-6">
              <div className="bg-blue-50 px-6 py-3 border-b">
                <h3 className="font-semibold text-blue-900">
                  Slide {slide.slideNumber}
                </h3>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {slide.text}
                  </p>
                </div>
                
                {slide.images && slide.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Images:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {slide.images.map((img, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`Slide ${slide.slideNumber} image ${imgIndex + 1}`}
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" />
            DocSend Scraper & PDF Converter
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Scraping Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Process DocSend Document</h2>
          
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
                Password/Passcode (if required)
              </label>
              <input
                type="password"
                placeholder="Leave blank if no password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {/* Side-by-side buttons - alternative version */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Scrape Texty
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handlePDFConvert}
                disabled={loading || !url}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Convert to PDF
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Help text */}
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Options:</strong>
            <ul className="mt-1 space-y-1">
              <li>• <strong>Scrape Text Content:</strong> Extract and view text content in your browser</li>
              <li>• <strong>Convert to PDF:</strong> Download the original document as a PDF file (faster, higher quality)</li>
            </ul>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search presentations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Presentations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Scraped Presentations ({filteredPresentations.length})
            </h2>
          </div>
          
          <div className="divide-y">
            {filteredPresentations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? 'No presentations match your search.' : 'No presentations scraped yet. Try adding a DocSend URL above!'}
              </div>
            ) : (
              filteredPresentations.map(presentation => (
                <div key={presentation._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {presentation.title || 'Untitled Presentation'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {presentation.slideCount || 0} slides
                      </p>
                      
                      {/* Preview */}
                      {presentation.slides && presentation.slides[0] && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <strong>Preview:</strong>
                          <p className="mt-1 text-gray-700">
                            {presentation.slides[0].text.substring(0, 150)}
                            {presentation.slides[0].text.length > 150 ? '...' : ''}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(presentation.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(presentation.status)}
                        <span className="text-sm capitalize text-gray-600">
                          {presentation.status}
                        </span>
                      </div>
                      
                      {presentation.status === 'completed' && (
                        <button
                          onClick={() => setSelectedPresentation(presentation)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Eye size={14} />
                          View All
                        </button>
                      )}
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