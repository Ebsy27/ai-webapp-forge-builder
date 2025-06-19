
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import Header from '../components/Header';
import { generateWebApplication, GeneratedCode } from '../services/aiService';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({
    'src/App.tsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to AI WebApp Builder</h1>
        <p>Start by describing what you want to build in the chat!</p>
        <div className="cta-section">
          <p className="cta-text">💡 Try asking for:</p>
          <ul className="suggestions">
            <li>"Create a todo app"</li>
            <li>"Build a calculator"</li>
            <li>"Make a portfolio website"</li>
            <li>"Design a landing page"</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;`,
    'src/App.css': `.App {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  color: white;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  margin-top: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #f0f0f0;
}

.suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.suggestions li:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}`,
    'package.json': `{
  "name": "ai-webapp-builder",
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
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    setIsGenerating(true);
    console.log('Starting AI code generation for:', userMessage);
    console.log('Files attached:', files);

    try {
      const newCode = await generateWebApplication(userMessage, files);
      setGeneratedCode(newCode);
      setHasGeneratedCode(true);
    } catch (error) {
      console.error('Error generating code:', error);
      // Enhanced fallback code
      const fallbackCode = {
        'src/App.tsx': `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated App: ${userMessage.slice(0, 30)}...</h1>
        <div className="counter-section">
          <div className="counter">
            <button 
              className="counter-btn" 
              onClick={() => setCount(count - 1)}
              aria-label="Decrease count"
            >
              −
            </button>
            <span className="count-display">{count}</span>
            <button 
              className="counter-btn" 
              onClick={() => setCount(count + 1)}
              aria-label="Increase count"
            >
              +
            </button>
          </div>
          <p className="description">AI generation fallback - Working on API integration</p>
        </div>
      </header>
    </div>
  );
}

export default App;`,
        'src/App.css': `.App {
  text-align: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 40px 20px;
  color: white;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: #06d6a0;
  margin-bottom: 40px;
  font-weight: 600;
  font-size: 2.5rem;
  line-height: 1.2;
}

.counter-section {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(6, 214, 160, 0.2);
  border-radius: 16px;
  padding: 32px;
  margin: 20px 0;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
}

.counter-btn {
  background: linear-gradient(135deg, #06d6a0 0%, #059669 100%);
  border: none;
  color: #0f172a;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(6, 214, 160, 0.3);
}

.count-display {
  font-size: 2rem;
  font-weight: 700;
  color: #06d6a0;
  min-width: 60px;
}

.description {
  color: #cbd5e1;
  font-weight: 400;
  margin: 0;
  font-size: 1rem;
}`,
        'package.json': `{
  "name": "ai-generated-fallback-app",
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
      
      setGeneratedCode(fallbackCode);
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
