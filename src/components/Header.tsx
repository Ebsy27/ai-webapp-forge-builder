
import { Code2, Sparkles, Zap, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                AI WebApp Builder
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Professional Development Platform
              </p>
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-600 font-medium">AI Online</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              <Zap className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-700 font-semibold">Fast Mode</span>
            </div>

            <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-purple-700 font-semibold">Pro</span>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="bg-white border-slate-300 hover:bg-slate-50">
            Docs
          </Button>
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            Get Started
          </Button>
        </nav>

        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
