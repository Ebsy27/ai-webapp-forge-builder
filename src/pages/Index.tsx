
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import Header from '../components/Header';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState({
    'App.js': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to your AI Generated App</h1>
        <p>Start chatting to generate your web application!</p>
      </header>
    </div>
  );
}

export default App;`,
    'App.css': `.App {
  text-align: center;
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

h1 {
  color: #61dafb;
  margin-bottom: 20px;
}

p {
  color: #ffffff;
}`
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    setIsGenerating(true);
    console.log('Generating code for:', userMessage);
    console.log('Files:', files);

    try {
      // Simulate API call - replace with actual GROQ + Local LLM integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated code based on user input
      const newCode = {
        'App.js': `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated App: ${userMessage.slice(0, 30)}...</h1>
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        <p>This app was generated based on your request!</p>
      </header>
    </div>
  );
}

export default App;`,
        'App.css': `.App {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  min-height: 100vh;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.counter {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 30px 0;
}

.counter button {
  background: #61dafb;
  border: none;
  color: #282c34;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.counter button:hover {
  background: #21a6c7;
  transform: scale(1.1);
}

.counter span {
  font-size: 24px;
  font-weight: bold;
  min-width: 40px;
}

h1 {
  color: #61dafb;
  margin-bottom: 20px;
}

p {
  color: #ffffff;
  margin-top: 20px;
}`
      };
      
      setGeneratedCode(newCode);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              💬 Chat
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              📝 Code
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
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
            <CodeEditor code={generatedCode} />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            <PreviewPane code={generatedCode} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
