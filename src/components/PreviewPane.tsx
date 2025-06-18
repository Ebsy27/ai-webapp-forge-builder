
import { Sandpack } from "@codesandbox/sandpack-react";

interface PreviewPaneProps {
  code: Record<string, string>;
}

const PreviewPane = ({ code }: PreviewPaneProps) => {
  return (
    <div className="h-full bg-white">
      <div className="h-full">
        <Sandpack
          template="react"
          files={code}
          theme="light"
          options={{
            showNavigator: false,
            showTabs: false,
            showLineNumbers: false,
            showInlineErrors: false,
            wrapContent: true,
            editorHeight: "100vh",
            layout: "preview",
            classes: {
              "sp-wrapper": "!h-full",
              "sp-layout": "!h-full",
              "sp-preview-container": "!h-full",
              "sp-preview-iframe": "!h-full !bg-white",
            }
          }}
          customSetup={{
            dependencies: {
              "react": "^18.0.0",
              "react-dom": "^18.0.0",
              "lucide-react": "^0.263.1"
            }
          }}
        />
      </div>
    </div>
  );
};

export default PreviewPane;
