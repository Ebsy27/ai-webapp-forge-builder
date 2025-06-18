
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
  code: Record<string, string>;
}

const CodeEditor = ({ code }: CodeEditorProps) => {
  const [activeFile, setActiveFile] = useState(Object.keys(code)[0] || 'App.js');
  const { toast } = useToast();

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
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
      title: "Download Started",
      description: "All files are being downloaded",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FileText className="w-6 h-6 mr-2 text-purple-400" />
          Generated Code
        </h2>
        <Button
          onClick={downloadAllFiles}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Professional File Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFile} onValueChange={setActiveFile}>
            <TabsList className="grid grid-cols-2 bg-gray-700 border-gray-600 mb-4">
              {Object.keys(code).map((filename) => (
                <TabsTrigger
                  key={filename}
                  value={filename}
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
                >
                  {filename}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(code).map(([filename, content]) => (
              <TabsContent key={filename} value={filename}>
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(content)}
                      className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="text-gray-100 whitespace-pre-wrap">
                      {content}
                    </code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-400">React</div>
              <div className="text-sm text-gray-300">Frontend Framework</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">Node.js</div>
              <div className="text-sm text-gray-300">Backend Runtime</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">Express</div>
              <div className="text-sm text-gray-300">Server Framework</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
