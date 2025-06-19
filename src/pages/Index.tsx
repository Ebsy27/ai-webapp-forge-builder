
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import Header from '../components/Header';
import { generateWebApplication, GeneratedCode } from '../services/aiService';

const Index = () => {
  // Initialize with empty state instead of default welcome content
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    console.log('🚀 Starting code generation process...');
    setIsGenerating(true);

    try {
      const newCode = await generateWebApplication(userMessage, files);
      console.log('✅ Code generation successful, updating state...');
      
      setGeneratedCode(newCode);
      setHasGeneratedCode(true);
      
      console.log('📝 Generated files:', Object.keys(newCode));
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      
      // Create a meaningful error fallback
      const errorFallback: GeneratedCode = {
        'src/App.tsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
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
    </div>
  );
}

export default App;`,
        'src/App.css': `.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.error-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-container h1 {
  color: #d63031;
  margin: 0 0 20px 0;
  font-size: 2rem;
}

.error-container p {
  color: #636e72;
  margin: 10px 0;
}

.error-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.retry-button {
  background: linear-gradient(135deg, #00b894, #00a085);
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
}`,
        'package.json': `{
  "name": "error-fallback-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}`
      };
      
      setGeneratedCode(errorFallback);
      setHasGeneratedCode(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 shadow-sm rounded-lg">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 font-medium transition-all"
            >
              💬 Chat
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 font-medium transition-all"
            >
              📝 Code
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 font-medium transition-all"
            >
              👁️ Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-6">
            <ChatInterface 
              onGenerateCode={handleCodeGeneration}
              isGenerating={isGenerating}
            />
          </TabsContent>
          
          <TabsContent value="code" className="mt-6">
            <CodeEditor code={generatedCode} hasGenerated={hasGeneratedCode} />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <PreviewPane code={generatedCode} hasGenerated={hasGeneratedCode} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
