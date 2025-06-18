
import { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import CodeEditor from '../components/CodeEditor';
import PreviewPane from '../components/PreviewPane';
import Header from '../components/Header';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview'>('chat');
  const [generatedCode, setGeneratedCode] = useState({
    'App.jsx': `import React, { useState } from 'react';
import { CheckCircle, Star, Users, TrendingUp, Shield, Globe, Menu, X, ArrowRight } from 'lucide-react';

const PleasApp = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-['Poppins']">
      {/* Modern Navigation with glassmorphism */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-white/80 border-b border-white/20 z-50 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex justify-between items-center w-20">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-lg">Sm</span>
              </div>
              <span className="ml-4 text-xl font-bold text-slate-900">SmartHealth</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">Features</a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">About</a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200">Contact</a>
              <button className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with professional background */}
      <section className="py-24 md:py-32 lg:py-40 relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Next-Generation
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Healthcare Technology
              </span>
              <br />
              That Saves Lives
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform patient care with AI-powered diagnostics, streamlined workflows, and HIPAA-compliant solutions trusted by leading medical institutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all duration-200 flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-white/80 backdrop-blur-sm text-slate-700 font-semibold py-4 px-8 rounded-xl border border-slate-200 hover:bg-white transition-colors duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PleasApp;`,
    'index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    'index.css': `.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}`,
    'package.json': `{
  "name": "ai-generated-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  }
}`
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleCodeGeneration = async (userMessage: string, files?: FileList) => {
    setIsGenerating(true);
    console.log('Generating code for:', userMessage);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveTab('code');
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-[calc(100vh-73px)]">
        {/* Chat Interface - Left Side */}
        {activeTab === 'chat' && (
          <div className="w-full max-w-md border-r border-gray-200 bg-white">
            <ChatInterface 
              onGenerateCode={handleCodeGeneration}
              isGenerating={isGenerating}
            />
          </div>
        )}
        
        {/* Code Editor - Middle */}
        {activeTab === 'code' && (
          <div className="flex-1 flex">
            <CodeEditor code={generatedCode} />
          </div>
        )}
        
        {/* Preview - Right Side */}
        {activeTab === 'preview' && (
          <div className="flex-1">
            <PreviewPane code={generatedCode} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
