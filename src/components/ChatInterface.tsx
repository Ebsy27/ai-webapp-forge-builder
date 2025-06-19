
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Paperclip, Loader2, User, Bot } from 'lucide-react';

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
      text: "Hi! I'm your AI assistant. Describe what you want to build and I'll create it for you instantly with professional images and modern fonts!",
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

    // Add enhanced thinking message
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "🚀 Initializing AI hybrid system... Using 70% GROQ API + 30% Local LLM to generate your professional web application with modern designs and responsive layouts...",
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
          text: `✨ Perfect! I've generated your professional web application using our hybrid AI system (GROQ + Local LLM) based on: "${inputText}". The application features modern designs, responsive layouts, and clean UI templates. Check out the Code and Preview tabs to see your new app in action!`,
          sender: 'ai',
          timestamp: new Date()
        })
      );
    } catch (error) {
      setMessages(prev => 
        prev.slice(0, -1).concat({
          id: (Date.now() + 2).toString(),
          text: "I apologize, but I encountered an error while connecting to our AI services. The system is attempting to use fallback generation. Please check that both GROQ API and Local LLM are accessible and try again.",
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
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-lg border border-gray-700">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-purple-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <Card className={`${
                message.sender === 'user' 
                  ? 'bg-purple-600 border-purple-500' 
                  : 'bg-gray-700 border-gray-600'
              }`}>
                <CardContent className="p-4">
                  <p className="text-white text-sm">{message.text}</p>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.files.map((file, index) => (
                        <div key={index} className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded">
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-300 mt-2">
                    {formatTime(message.timestamp)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <p className="text-white text-sm">Generating your application...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              placeholder="Describe what you want to build (calculator, website, todo app, etc.)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
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
                  <div key={index} className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded inline-block mr-2">
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
              className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              <Paperclip className="w-4 h-4 text-gray-300" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !attachedFiles) || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
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
            Press Shift+Enter for new line • Hybrid AI: 10% Local first, 90% Groq for consistent high quality
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
