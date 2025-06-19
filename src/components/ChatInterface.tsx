
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Paperclip, Loader2, User, Bot, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  files?: File[];
}

interface ChatInterfaceProps {
  onGenerateCode: (message: string, files?: FileList) => Promise<void>;
  isGenerating: boolean;
}

const ChatInterface = ({ onGenerateCode, isGenerating }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! I'm your AI-powered web application builder. I can create modern, responsive websites with beautiful designs, professional fonts, and engaging user interfaces.\n\n✨ Just describe what you want to build, and I'll generate it using our hybrid AI system (70% GROQ + 30% Local LLM)!\n\n💡 Try something like:\n• \"Create a calculator app\"\n• \"Build a todo list application\"\n• \"Make a portfolio website\"\n• \"Design a landing page for a restaurant\"",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim() && !attachedFiles) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      files: attachedFiles ? Array.from(attachedFiles) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Enhanced thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "🚀 Initializing AI hybrid system...\n📡 Connecting to GROQ API (70%)\n🖥️ Engaging Local LLM (30%)\n🎨 Generating professional web application with modern designs...",
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      await onGenerateCode(inputText, attachedFiles || undefined);
      
      // Replace thinking message with success message
      setMessages(prev => 
        prev.slice(0, -1).concat({
          id: (Date.now() + 2).toString(),
          text: `🎉 Perfect! I've successfully generated your professional web application!\n\n✅ **Generated for:** "${inputText}"\n🎨 **Features:** Modern design, responsive layout, professional typography\n⚡ **Technology:** React + CSS with advanced styling\n\n📋 Check out the **Code** tab to see the generated files\n👁️ Visit the **Preview** tab to see your app in action!\n\n🚀 Your application is ready to use and can be further customized!`,
          sender: 'ai',
          timestamp: new Date()
        })
      );
    } catch (error) {
      setMessages(prev => 
        prev.slice(0, -1).concat({
          id: (Date.now() + 2).toString(),
          text: "⚠️ I encountered an issue while connecting to our AI services. However, I've generated a fallback application for you.\n\n🔧 **Status:** Using backup generation system\n📝 **Note:** The APIs might need configuration\n\n💡 **What's working:** You can still see a functional app in the Preview tab!\n\n🔄 Feel free to try again or describe a different type of application.",
          sender: 'ai',
          timestamp: new Date()
        })
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttachedFiles(event.target.files);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI WebApp Builder</h3>
            <p className="text-xs text-gray-500">Hybrid AI • GROQ + Local LLM</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}>
                {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <Card className={`${
                message.sender === 'user' 
                  ? 'bg-blue-500 border-blue-400' 
                  : 'bg-white border-gray-200'
              } shadow-sm`}>
                <CardContent className="p-3">
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === 'user' ? 'text-white' : 'text-gray-700'
                  }`}>
                    {message.text}
                  </p>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.files.map((file, index) => (
                        <div key={index} className="text-xs bg-white/20 text-white px-2 py-1 rounded inline-block mr-2">
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <p className="text-gray-700 text-sm">Generating your application...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              placeholder="Describe what you want to build (e.g., 'Create a modern calculator app with dark theme')..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-white border-gray-300 text-gray-700 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            {attachedFiles && attachedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(attachedFiles).map((file, index) => (
                  <div key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mr-2">
                    📎 {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border-gray-300 hover:bg-gray-50"
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !attachedFiles) || isGenerating}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            Press Shift+Enter for new line • Enhanced with Hybrid AI: 70% GROQ + 30% Local LLM
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
