
import { Sandpack } from "@codesandbox/sandpack-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PreviewPaneProps {
  code: Record<string, string>;
}

const PreviewPane = ({ code }: PreviewPaneProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Eye className="w-6 h-6 mr-2 text-purple-400" />
          Live Preview
        </h2>
        <Button
          variant="outline"
          className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Fully Functional Sandpack View</CardTitle>
          <p className="text-gray-400 text-sm">
            Your generated application running in a live environment
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <Sandpack
              template="react"
              files={code}
              theme="dark"
              options={{
                showNavigator: true,
                showTabs: true,
                showLineNumbers: true,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: 600,
                classes: {
                  "sp-wrapper": "!bg-gray-900",
                  "sp-layout": "!bg-gray-900",
                  "sp-tab-button": "!bg-gray-800 !text-white",
                  "sp-code-editor": "!bg-gray-900",
                  "sp-preview-container": "!bg-white",
                }
              }}
              customSetup={{
                dependencies: {
                  "react": "^18.0.0",
                  "react-dom": "^18.0.0"
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">Features Generated</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm text-gray-300">Modern UI</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm text-gray-300">Responsive</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm text-gray-300">Clean Code</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">✓</div>
                <div className="text-sm text-gray-300">Professional</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewPane;
