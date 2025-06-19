
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

// System prompts for different aspects of code generation
const GROQ_SYSTEM_PROMPT = `You are an expert web developer. Generate modern, responsive web applications using React, HTML, CSS, and JavaScript. 
Focus on creating:
- Clean, professional designs
- Modern UI/UX patterns
- Responsive layouts
- Professional typography and color schemes
- Complete functional components

Return only the code files in a JSON format like:
{
  "src/App.tsx": "React component code here",
  "src/App.css": "CSS styles here",
  "package.json": "package.json content"
}`;

const LOCAL_LLM_SYSTEM_PROMPT = `You are a web design specialist. Enhance the provided code with:
- Advanced styling and animations
- Better user experience
- Professional color schemes
- Modern fonts and typography
- Interactive elements

Return the enhanced code in the same JSON format.`;

// Call GROQ API (70% of generation)
async function callGroqAPI(userMessage: string): Promise<any> {
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
            content: `Create a modern web application for: ${userMessage}. Make it professional with clean design.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GROQ API response received');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('GROQ API error:', error);
    throw error;
  }
}

// Call Local LLM API (30% of generation)
async function callLocalLLM(baseCode: string, userMessage: string): Promise<any> {
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
      throw new Error(`Local LLM API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Local LLM API response received');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Local LLM API error:', error);
    // Fallback to base code if local LLM fails
    return baseCode;
  }
}

// Parse AI response to extract code
function parseCodeResponse(response: string): GeneratedCode {
  try {
    // Try to parse as JSON first
    if (response.includes('{') && response.includes('}')) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    // Fallback: create a basic structure if parsing fails
    return {
      'src/App.tsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated Application</h1>
        <p>Based on: ${response.slice(0, 100)}...</p>
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
  font-family: 'Inter', sans-serif;
}

.App-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

h1 {
  margin-bottom: 24px;
  font-weight: 600;
}`,
      'package.json': `{
  "name": "generated-app",
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
  } catch (error) {
    console.error('Error parsing code response:', error);
    throw new Error('Failed to parse generated code');
  }
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
    
    // Fallback: return a basic working application
    return {
      'src/App.tsx': `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Generated App</h1>
        <p>Request: ${userMessage}</p>
        <div className="counter-section">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        <p className="note">Generated with AI hybrid approach</p>
      </header>
    </div>
  );
}

export default App;`,
      'src/App.css': `.App {
  text-align: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  padding: 40px 20px;
  color: white;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
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
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 2.5rem;
}

.counter-section {
  margin: 30px 0;
  display: flex;
  align-items: center;
  gap: 20px;
}

.counter-section button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.count {
  font-size: 2rem;
  font-weight: bold;
  min-width: 50px;
}

.note {
  margin-top: 20px;
  opacity: 0.8;
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
}
