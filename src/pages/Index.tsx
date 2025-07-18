import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import { generateWebsite, GeneratedCode } from '../services/aiService';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);
  const [showSplitView, setShowSplitView] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    console.log('🚀 Starting code generation process...');
    setIsGenerating(true);
    setShowSplitView(true);

    try {
      const newCode = await generateWebsite(userMessage);
      console.log('✅ Code generation successful, updating state...');
      console.log('Generated files:', Object.keys(newCode));
      
      setGeneratedCode(newCode);
      setHasGeneratedCode(true);
      
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      
      const errorFallback: GeneratedCode = {
        '/src/App.js': { 
          code: `import React from 'react';

function App() {
  return (
    <div className="error-container">
      <h1>⚠️ Generation Error</h1>
      <p>There was an issue generating your application.</p>
      <div className="error-details">
        <p><strong>Request:</strong> "${userMessage}"</p>
        <p><strong>Status:</strong> API connection failed</p>
        <p><strong>Fallback:</strong> Basic template loaded</p>
      </div>
      <button onClick={() => window.location.reload()} className="retry-button">
        🔄 Try Again
      </button>
    </div>
  );
}

export default App;` 
        },
        '/src/index.js': { 
          code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);` 
        },
        '/src/App.css': { 
          code: `.error-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', sans-serif;
  text-align: center;
  color: white;
}

.error-container h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.error-details {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  backdrop-filter: blur(10px);
}

.retry-button {
  background: #00b894;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.retry-button:hover {
  transform: translateY(-2px);
}` 
        },
        '/public/index.html': { 
          code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Error - App Generation Failed</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>` 
        },
        '/package.json': { 
          code: `{
  "name": "error-fallback-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}` 
        }
      };
      
      setGeneratedCode(errorFallback);
      setHasGeneratedCode(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const transformCodeForEditor = (code: GeneratedCode): Record<string, string> => {
    const transformed: Record<string, string> = {};
    Object.entries(code).forEach(([filepath, fileContent]) => {
      if (fileContent && fileContent.code) {
        transformed[filepath] = fileContent.code;
      }
    });
    return transformed;
  };

  // Show split view after generation
  if (showSplitView) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        {/* Left Panel - Chat */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">New Project</h2>
                <p className="text-gray-400 text-sm">Chat with AGISOL to build your app</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <ChatInterface 
              onGenerateCode={handleCodeGeneration}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Right Panel - Preview/Code */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'code'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📝 Code
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors">
                  📋 Copy
                </button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors">
                  ⬇️ Download
                </button>
                <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                  🚀 Deploy
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50">
            {activeTab === 'preview' ? (
              <PreviewPane code={generatedCode} hasGenerated={hasGeneratedCode} />
            ) : (
              <CodeEditor code={transformCodeForEditor(generatedCode)} hasGenerated={hasGeneratedCode} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Landing page view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AGISOL</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Community</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Enterprise</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Learn</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Launched</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">Log in</button>
              <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                Get started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Build something{' '}
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            AGISOL
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Create apps and websites by chatting with AI
        </p>
        
        {/* Chat Input */}
        <div className="max-w-2xl mx-auto">
          <ChatInterface 
            onGenerateCode={handleCodeGeneration}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Community Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">From the Community</h2>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['Popular', 'Discover', 'Internal Tools', 'Website', 'Personal', 'Consumer App', 'B2B App', 'Prototype'].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'Popular'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter}
            </button>
          ))}
          <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
            View All →
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                <div className="absolute top-3 right-3">
                  <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">Website</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Sample Project {i + 1}</h3>
                <p className="text-sm text-gray-500">{Math.floor(Math.random() * 5000)} Remixes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
