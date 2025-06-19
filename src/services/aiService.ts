
// API Configuration - hardcoded as requested
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeneratedCode {
  [filename: string]: string;
}

// Enhanced system prompts
const GROQ_SYSTEM_PROMPT = `You are an expert web developer. Generate modern, responsive web applications using React, HTML, CSS, and JavaScript. 

IMPORTANT: You must return ONLY a valid JSON object in this exact format:
{
  "src/App.tsx": "React component code here",
  "src/App.css": "CSS styles here", 
  "package.json": "package.json content here"
}

Focus on creating:
- Clean, professional designs with modern UI/UX
- Responsive layouts that work on all devices
- Professional typography and color schemes
- Complete functional components
- Beautiful styling with gradients and modern effects

Do not include any text before or after the JSON. Return only the JSON object.`;

const LOCAL_LLM_SYSTEM_PROMPT = `You are a web design specialist. Enhance the provided code with advanced styling and better user experience.

IMPORTANT: You must return ONLY a valid JSON object in this exact format:
{
  "src/App.tsx": "Enhanced React component code",
  "src/App.css": "Enhanced CSS styles",
  "package.json": "Enhanced package.json"
}

Enhance with:
- Advanced styling and smooth animations
- Better user experience and interactivity
- Professional color schemes and typography
- Modern design patterns
- Interactive elements and hover effects

Do not include any text before or after the JSON. Return only the JSON object.`;

// Call GROQ API
async function callGroqAPI(userMessage: string): Promise<string> {
  try {
    console.log('Calling GROQ API...');
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: GROQ_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Create a modern, professional web application for: ${userMessage}. Make it visually appealing with clean design, proper spacing, and modern UI elements.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GROQ API response received');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('GROQ API error:', error);
    throw error;
  }
}

// Call Local LLM API
async function callLocalLLM(baseCode: string, userMessage: string): Promise<string> {
  try {
    console.log('Calling Local LLM API...');
    const response = await fetch(LOCAL_LLM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: [
          {
            role: 'system',
            content: LOCAL_LLM_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Enhance this code for "${userMessage}": ${baseCode}`
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Local LLM API response received');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Local LLM API error:', error);
    // Return base code if local LLM fails
    return baseCode;
  }
}

// Enhanced parsing function with better error handling
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('Parsing AI response...');
    
    // Clean the response - remove any markdown code blocks
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    
    // Find JSON object in the response
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    const jsonString = cleanedResponse.substring(jsonStart, jsonEnd);
    const parsedCode = JSON.parse(jsonString);
    
    // Validate that required files are present
    if (!parsedCode['src/App.tsx'] || !parsedCode['src/App.css'] || !parsedCode['package.json']) {
      throw new Error('Missing required files in generated code');
    }
    
    console.log('Successfully parsed code response');
    return parsedCode;
  } catch (error) {
    console.error('Error parsing code response:', error);
    console.log('Raw response:', response);
    
    // Return a working fallback
    return getDefaultCode();
  }
}

// Get default empty state
function getDefaultCode(): GeneratedCode {
  return {
    'src/App.tsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to AI WebApp Builder</h1>
        <p>Start by describing what you want to build in the chat!</p>
        <div className="cta-section">
          <p className="cta-text">💡 Try asking for:</p>
          <ul className="suggestions">
            <li>"Create a todo app"</li>
            <li>"Build a calculator"</li>
            <li>"Make a portfolio website"</li>
            <li>"Design a landing page"</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;`,
    'src/App.css': `.App {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  color: white;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cta-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  margin-top: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #f0f0f0;
}

.suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.suggestions li:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}`,
    'package.json': `{
  "name": "ai-webapp-builder",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}`
  };
}

// Main function to generate code using hybrid AI approach
export async function generateWebApplication(userMessage: string, files?: FileList): Promise<GeneratedCode> {
  try {
    console.log('Starting hybrid AI code generation...');
    
    // Step 1: Get base code from GROQ API (70%)
    const groqResponse = await callGroqAPI(userMessage);
    console.log('GROQ generation completed');
    
    // Step 2: Enhance with Local LLM (30%)
    const enhancedResponse = await callLocalLLM(groqResponse, userMessage);
    console.log('Local LLM enhancement completed');
    
    // Step 3: Parse and return the final code
    const generatedCode = parseCodeResponse(enhancedResponse);
    console.log('Code generation successful');
    
    return generatedCode;
  } catch (error) {
    console.error('Code generation failed:', error);
    
    // Return enhanced fallback based on user message
    return createFallbackCode(userMessage);
  }
}

// Create a better fallback based on user input
function createFallbackCode(userMessage: string): GeneratedCode {
  const appName = userMessage.toLowerCase().includes('calculator') ? 'Calculator' :
                  userMessage.toLowerCase().includes('todo') ? 'Todo App' :
                  userMessage.toLowerCase().includes('portfolio') ? 'Portfolio' :
                  'Generated App';
  
  return {
    'src/App.tsx': `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>${appName}</h1>
        <p>Request: ${userMessage}</p>
        <div className="content-section">
          <div className="counter">
            <button onClick={() => setCount(count - 1)} className="btn">-</button>
            <span className="count">{count}</span>
            <button onClick={() => setCount(count + 1)} className="btn">+</button>
          </div>
          <p className="note">AI generation in progress - this is a fallback app</p>
        </div>
      </header>
    </div>
  );
}

export default App;`,
    'src/App.css': `.App {
  text-align: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
  padding: 40px 20px;
  color: white;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 40px;
  margin: 30px 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn {
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border: none;
  color: #6366f1;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.count {
  font-size: 2.5rem;
  font-weight: 700;
  min-width: 80px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.note {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}`,
    'package.json': `{
  "name": "ai-generated-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}`
  };
}
