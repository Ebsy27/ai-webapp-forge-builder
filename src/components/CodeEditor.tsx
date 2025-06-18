
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, Folder, File } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: Record<string, string>;
}

const CodeEditor = ({ code }: CodeEditorProps) => {
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
    if (filename.includes('/')) return <File className="w-4 h-4" />;
    if (filename === 'package.json') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Generated Code</h2>
            <p className="text-sm text-muted-foreground">Professional file structure</p>
          </div>
        </div>
        <Button
          onClick={downloadAllFiles}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Explorer */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center">
              <Folder className="w-4 h-4 mr-2 text-primary" />
              Project Files
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {Object.entries(getFileStructure()).map(([folder, files]) => (
                <div key={folder} className="px-3 pb-2">
                  {folder !== 'root' && (
                    <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center">
                      <Folder className="w-3 h-3 mr-1" />
                      {folder}
                    </div>
                  )}
                  {files.map((filename) => (
                    <button
                      key={filename}
                      onClick={() => setActiveFile(filename)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded flex items-center transition-colors ${
                        activeFile === filename
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                {getFileIcon(activeFile)}
                <span className="ml-2">{activeFile}</span>
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(code[activeFile])}
                className="bg-secondary border-border hover:bg-accent text-foreground"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <pre className="bg-secondary/50 p-4 text-sm overflow-x-auto max-h-[500px] overflow-y-auto language-typescript">
                <code className="text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {code[activeFile]}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-primary mb-1">{Object.keys(code).length}</div>
            <div className="text-xs text-muted-foreground">Files Generated</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-400 mb-1">React</div>
            <div className="text-xs text-muted-foreground">Framework</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-400 mb-1">TypeScript</div>
            <div className="text-xs text-muted-foreground">Language</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-400 mb-1">Vite</div>
            <div className="text-xs text-muted-foreground">Build Tool</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeEditor;
