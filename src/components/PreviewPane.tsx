
import { Sandpack } from "@codesandbox/sandpack-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ExternalLink, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PreviewPaneProps {
  code: Record<string, string>;
}

const PreviewPane = ({ code }: PreviewPaneProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
            <Eye className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Live Preview</h2>
            <p className="text-sm text-muted-foreground">Real-time application preview</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-secondary border-border hover:bg-accent text-foreground"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </Button>
      </div>

      <Card className="bg-card border-border shadow-professional-lg">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground font-medium flex items-center">
              <Play className="w-4 h-4 mr-2 text-primary" />
              Application Preview
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] rounded-b-lg overflow-hidden">
            <Sandpack
              template="react"
              files={code}
              theme="dark"
              options={{
                showNavigator: false,
                showTabs: true,
                showLineNumbers: false,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: 600,
                layout: "preview",
                classes: {
                  "sp-wrapper": "!bg-card",
                  "sp-layout": "!bg-card",
                  "sp-tab-button": "!bg-secondary !text-foreground !border-border",
                  "sp-code-editor": "!bg-card",
                  "sp-preview-container": "!bg-background",
                  "sp-preview-iframe": "!bg-white",
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">React</div>
            <div className="text-xs text-muted-foreground">Frontend Framework</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">TypeScript</div>
            <div className="text-xs text-muted-foreground">Type Safety</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">Vite</div>
            <div className="text-xs text-muted-foreground">Build Tool</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">AI-Gen</div>
            <div className="text-xs text-muted-foreground">Auto Generated</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewPane;
