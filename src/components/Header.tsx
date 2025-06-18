
import { Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Hybrid AI Builder</h1>
            <p className="text-xs text-gray-500">10% Local LLM first + 90% Groq for optimal quality & reliability</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Local LLM + Groq Ready</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-3 py-1.5 text-sm text-gray-700 hover:text-purple-600 border-b-2 border-transparent hover:border-purple-600 transition-colors">
              Live Preview
            </button>
            <button className="px-3 py-1.5 text-sm text-purple-600 border-b-2 border-purple-600">
              Source Code
            </button>
          </div>
          
          <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            Export Project
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
