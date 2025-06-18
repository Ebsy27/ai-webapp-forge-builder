
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: Record<string, string>;
}

const CodeEditor = ({ code }: CodeEditorProps) => {
  const [activeFile, setActiveFile] = useState('App.jsx');
  const { toast } = useToast();

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Code copied successfully",
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const projectFiles = [
    { name: 'App.jsx', type: 'file' },
    { name: 'index.js', type: 'file' },
    { name: 'index.html', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ];

  return (
    <div className="flex h-full">
      {/* File Explorer */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Project Files</h3>
        </div>
        <div className="p-2">
          {projectFiles.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-gray-100 transition-colors ${
                activeFile === file.name ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
              }`}
            >
              📄 {file.name}
            </button>
          ))}
        </div>
        
        <div className="p-3 border-t border-gray-200 mt-4">
          <div className="space-y-2">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs font-medium text-gray-900 mb-1">Project Details</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Type: Business Website</div>
                <div>Industry: Healthcare</div>
                <div>Components: App</div>
                <div>Features: 9</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs font-medium text-gray-900 mb-1">Value:</div>
              <div className="text-xs text-gray-600">
                Reduce administrative time by 60% while improving patient care
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code View */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <span className="text-sm font-medium text-gray-900">{activeFile}</span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(code[activeFile] || '')}
              className="text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Code
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <pre className="p-4 text-xs leading-relaxed font-mono text-gray-800 bg-gray-50 h-full">
            <code>{code[activeFile] || '// File not found'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
