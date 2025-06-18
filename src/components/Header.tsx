
import { Code2, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-professional">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-professional">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">AI NG WebApp Builder</h1>
            <p className="text-sm text-muted-foreground font-normal">
              Professional AI-Powered Development Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground font-medium">Hybrid AI Ready</span>
            </div>
            <div className="flex items-center space-x-1 bg-secondary px-3 py-1.5 rounded-lg">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-foreground font-medium">70% GROQ + 30% Local</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
