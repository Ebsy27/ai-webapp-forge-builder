
import { Sandpack } from "@codesandbox/sandpack-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ExternalLink, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PreviewPaneProps {
  code: Record<string, { code: string }>;
  hasGenerated?: boolean;
}

const PreviewPane = ({ code, hasGenerated = false }: PreviewPaneProps) => {
  if (!hasGenerated || Object.keys(code).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Preview Available</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Generate your web application first in the Chat tab to see the live preview here. 
            Your app will appear in real-time as it's being created!
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-sm mx-auto">
            <p className="text-sm text-gray-600 font-medium mb-2">🚀 What you'll see:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Live interactive preview</li>
              <li>• Responsive design testing</li>
              <li>• Real-time code execution</li>
              <li>• Professional UI components</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Prepare files for Sandpack with proper structure
  console.log('📝 Preparing Sandpack files from:', Object.keys(code));
  
  // Convert our code structure to Sandpack format
  const sandpackFiles: Record<string, string> = {};
  
  Object.entries(code).forEach(([filepath, fileContent]) => {
    if (fileContent && fileContent.code) {
      sandpackFiles[filepath] = fileContent.code;
      console.log(`✅ Added file: ${filepath} (${fileContent.code.length} chars)`);
    }
  });

  // Ensure we have the minimum required files
  if (!sandpackFiles['/src/App.js']) {
    console.warn('⚠️ Missing /src/App.js, adding fallback');
    sandpackFiles['/src/App.js'] = `import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Hello World</h1>
      <p>Your app is loading...</p>
    </div>
  );
}

export default App;`;
  }

  if (!sandpackFiles['/src/index.js']) {
    console.warn('⚠️ Missing /src/index.js, adding fallback');
    sandpackFiles['/src/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`;
  }

  console.log('🎯 Final Sandpack files:', Object.keys(sandpackFiles));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-500">Real-time application preview • Interactive sandbox</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white border-gray-300 hover:bg-gray-50 text-gray-600"
          onClick={() => {
            const newWindow = window.open('', '_blank');
            if (newWindow && sandpackFiles['/public/index.html'] && sandpackFiles['/src/App.js']) {
              const htmlContent = sandpackFiles['/public/index.html'];
              const appCode = sandpackFiles['/src/App.js'];
              const cssCode = sandpackFiles['/src/App.css'] || '';
              
              // Create a simple HTML page with the React app
              const fullHtml = htmlContent
                .replace('</head>', `<style>${cssCode}</style></head>`)
                .replace('<div id="root"></div>', `
                  <div id="root"></div>
                  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                  <script type="text/babel">
                    ${appCode}
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(App));
                  </script>
                `);
              
              newWindow.document.write(fullHtml);
              newWindow.document.close();
            }
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </Button>
      </div>

      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-700 font-medium flex items-center">
              <Play className="w-4 h-4 mr-2 text-green-500" />
              Application Preview
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 font-medium">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] rounded-b-lg overflow-hidden">
            <Sandpack
              template="react"
              files={sandpackFiles}
              theme="light"
              options={{
                showNavigator: false,
                showTabs: false,
                showLineNumbers: false,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: 600,
                layout: "preview",
                editorWidthPercentage: 0,
                autoReload: true,
                autorun: true
              }}
              customSetup={{
                dependencies: {
                  "react": "^18.2.0",
                  "react-dom": "^18.2.0"
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">React</div>
            <div className="text-xs text-gray-500">Frontend Framework</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">CSS3</div>
            <div className="text-xs text-gray-500">Modern Styling</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">Sandpack</div>
            <div className="text-xs text-gray-500">Live Preview</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500 mb-1">AI-Gen</div>
            <div className="text-xs text-gray-500">Hybrid AI System</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewPane;
