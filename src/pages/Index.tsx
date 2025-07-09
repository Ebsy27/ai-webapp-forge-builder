import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import Header from '../components/Header';
import { generateWebsite, GeneratedCode } from '../services/aiService';
import PromptSuggestions from '../components/enhanced/PromptSuggestions';
import FeedbackSystem from '../components/enhanced/FeedbackSystem';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    console.log('🚀 Starting enhanced code generation process...');
    setIsGenerating(true);
    setShowSuggestions(false);

    try {
      const newCode = await generateWebsite(userMessage);
      console.log('✅ Enhanced code generation successful, updating state...');
      console.log('Generated files:', Object.keys(newCode));
      
      setGeneratedCode(newCode);
      setHasGeneratedCode(true);
      
    } catch (error) {
      console.error('❌ Enhanced code generation failed:', error);
      
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

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    handleCodeGeneration(suggestion);
  };

  const handleFeedbackSubmit = (feedback: any) => {
    console.log('📊 Feedback received:', feedback);
    setFeedbackData(prev => [...prev, feedback]);
    
    // Here you could send feedback to analytics service
    // trackFeedback(feedback);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />
      
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Build Professional Apps with
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Enhanced AI</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into production-ready web applications with our advanced AI-powered platform. 
              Generate modern, responsive websites with dark themes, accessibility features, and premium design.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                🌙 Modern Dark Themes
              </div>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                ♿ Accessibility Built-in
              </div>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                🎨 Premium Design
              </div>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                🚀 Production Ready
              </div>
              <div className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-700 shadow-sm">
                📱 Fully Responsive
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="chat" className="w-full">
          <div className="mb-8">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-slate-200">
              <TabsTrigger 
                value="chat" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
              >
                💬 Enhanced Chat & Generate
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
              >
                📝 Source Code
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
              >
                👁️ Live Preview
              </TabsTrigger>
              <TabsTrigger 
                value="feedback" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
              >
                ⭐ Feedback
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <ChatInterface 
                onGenerateCode={handleCodeGeneration}
                isGenerating={isGenerating}
              />
            </div>
            
            {showSuggestions && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <PromptSuggestions onSuggestionClick={handleSuggestionClick} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="code" className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <CodeEditor code={transformCodeForEditor(generatedCode)} hasGenerated={hasGeneratedCode} />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <PreviewPane code={generatedCode} hasGenerated={hasGeneratedCode} />
            </div>
          </TabsContent>
          
          <TabsContent value="feedback" className="space-y-6">
            <FeedbackSystem 
              onFeedbackSubmit={handleFeedbackSubmit}
              hasGeneratedCode={hasGeneratedCode}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Features Section */}
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Next-Generation AI Web Development
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Dark Theme First</h3>
              <p className="text-slate-600">Every website features elegant dark themes with sophisticated color palettes and modern aesthetics.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">♿</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Accessibility Built-in</h3>
              <p className="text-slate-600">WCAG 2.1 AA compliance with keyboard navigation, screen readers, and proper contrast ratios.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Production Ready</h3>
              <p className="text-slate-600">Clean, optimized code with SEO, performance optimization, and security best practices included.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Quality Assured</h3>
              <p className="text-slate-600">Every generated website is automatically quality-checked and enhanced for maximum performance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
