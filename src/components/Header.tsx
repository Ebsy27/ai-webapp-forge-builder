
import { Code2, Zap, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI WebApp Builder</h1>
            <p className="text-sm text-gray-500 font-normal">
              Professional AI-Powered Development Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Hybrid AI Ready</span>
            </div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-700 font-medium">70% GROQ + 30% Local</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
