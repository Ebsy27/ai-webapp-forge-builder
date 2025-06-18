
import { Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI NG WebApp Builder</h1>
            <p className="text-sm text-gray-400">
              Hybrid AI: 70% Groq + 30% Local LLM for optimal quality & reliability
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Local LLM + Groq Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
