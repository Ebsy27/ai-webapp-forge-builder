
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import Header from '../components/Header';
import { generateWebApplication, GeneratedCode } from '../services/aiService';

const Index = () => {
  // Initialize with empty state
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    console.log('🚀 Starting code generation process...');
    setIsGenerating(true);

    try {
      const newCode = await generateWebApplication(userMessage, files);
      console.log('✅ Code generation successful, updating state...');
      console.log('Generated files:', Object.keys(newCode));
      
      setGeneratedCode(newCode);
      setHasGeneratedCode(true);
      
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      
      // Create a meaningful error fallback with proper Sandpack structure
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

  // Transform GeneratedCode to the format expected by components
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700 shadow-2xl rounded-xl backdrop-blur-sm">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-300 font-semibold transition-all duration-300 hover:text-white rounded-lg"
            >
              💬 AI Chat
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-300 font-semibold transition-all duration-300 hover:text-white rounded-lg"
            >
              📝 Source Code
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white text-gray-300 font-semibold transition-all duration-300 hover:text-white rounded-lg"
            >
              👁️ Live Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-8">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
              <ChatInterface 
                onGenerateCode={handleCodeGeneration}
                isGenerating={isGenerating}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="mt-8">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
              <CodeEditor code={transformCodeForEditor(generatedCode)} hasGenerated={hasGeneratedCode} />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-8">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl">
              <PreviewPane code={generatedCode} hasGenerated={hasGeneratedCode} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-1/4 left-10 w-2 h-32 bg-gradient-to-b from-blue-500 to-transparent opacity-20 rounded-full"></div>
      <div className="fixed bottom-1/4 right-10 w-2 h-24 bg-gradient-to-t from-purple-500 to-transparent opacity-20 rounded-full"></div>
      
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
    </div>
  );
};

export default Index;
