
import { Code2, Zap, Sparkles, Cpu, Bot } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-black/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4 shadow-2xl">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-black"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI WebApp Builder
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              Professional AI-Powered Development Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-gray-700">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300 font-medium">AI System Online</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2 rounded-xl border border-blue-500/30 backdrop-blur-sm">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-semibold">Hybrid AI Engine</span>
            </div>

            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-600/20 to-green-600/20 px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-semibold">Real-time Processing</span>
            </div>

            <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-600/20 to-red-600/20 px-4 py-2 rounded-xl border border-orange-500/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-300 font-semibold">Pro Features</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none"></div>
    </header>
  );
};

export default Header;
