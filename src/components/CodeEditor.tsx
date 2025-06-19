
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, Folder, File, Code } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: Record<string, string>;
  hasGenerated?: boolean;
}

const CodeEditor = ({ code, hasGenerated = false }: CodeEditorProps) => {
  const [activeFile, setActiveFile] = useState(Object.keys(code)[0] || 'src/App.tsx');
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

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAllFiles = () => {
    Object.entries(code).forEach(([filename, content]) => {
      setTimeout(() => downloadFile(filename, content), 100);
    });
    toast({
      title: "Download started",
      description: "All files are being downloaded",
    });
  };

  const getFileIcon = (filename: string) => {
    if (filename.includes('.tsx') || filename.includes('.jsx')) return <Code className="w-4 h-4 text-blue-500" />;
    if (filename.includes('.css')) return <File className="w-4 h-4 text-green-500" />;
    if (filename === 'package.json') return <FileText className="w-4 h-4 text-orange-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getFileStructure = () => {
    const structure: Record<string, string[]> = {};
    Object.keys(code).forEach(filename => {
      if (filename.includes('/')) {
        const parts = filename.split('/');
        const folder = parts[0];
        if (!structure[folder]) structure[folder] = [];
        structure[folder].push(filename);
      } else {
        if (!structure['root']) structure['root'] = [];
        structure['root'].push(filename);
      }
    });
    return structure;
  };

  if (!hasGenerated) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Code Generated Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start a conversation in the Chat tab to generate your web application. 
            Describe what you want to build and I'll create the code for you!
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-sm mx-auto">
            <p className="text-sm text-gray-600 font-medium mb-2">💡 Try asking for:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• "Create a calculator app"</li>
              <li>• "Build a todo list"</li>
              <li>• "Make a portfolio website"</li>
              <li>• "Design a landing page"</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Generated Code</h2>
            <p className="text-sm text-gray-500">Professional file structure • Ready to use</p>
          </div>
        </div>
        <Button
          onClick={downloadAllFiles}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Explorer */}
        <Card className="bg-white border border-gray-200 lg:col-span-1 shadow-sm">
          <CardHeader className="pb-3 bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
              <Folder className="w-4 h-4 mr-2 text-blue-500" />
              Project Files
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {Object.entries(getFileStructure()).map(([folder, files]) => (
                <div key={folder} className="px-3 pb-2">
                  {folder !== 'root' && (
                    <div className="text-xs font-medium text-gray-500 mb-1 flex items-center py-2">
                      <Folder className="w-3 h-3 mr-1" />
                      {folder}
                    </div>
                  )}
                  {files.map((filename) => (
                    <button
                      key={filename}
                      onClick={() => setActiveFile(filename)}
                      className={`w-full text-left text-xs px-2 py-2 rounded flex items-center transition-colors ${
                        activeFile === filename
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {getFileIcon(filename)}
                      <span className="ml-2 truncate">
                        {filename.includes('/') ? filename.split('/').pop() : filename}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Code View */}
        <Card className="bg-white border border-gray-200 lg:col-span-3 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                {getFileIcon(activeFile)}
                <span className="ml-2">{activeFile}</span>
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(code[activeFile])}
                className="bg-white border-gray-300 hover:bg-gray-50 text-gray-600"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <pre className="bg-gray-50 p-4 text-sm overflow-x-auto max-h-[500px] overflow-y-auto">
                <code className="text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {code[activeFile]}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">{Object.keys(code).length}</div>
            <div className="text-xs text-gray-500">Files Generated</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">React</div>
            <div className="text-xs text-gray-500">Framework</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">TypeScript</div>
            <div className="text-xs text-gray-500">Language</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1">Vite</div>
            <div className="text-xs text-gray-500">Build Tool</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeEditor;
