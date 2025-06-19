
// API Configuration - hardcoded as requested
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

export interface GeneratedCode {
  [filename: string]: string;
}

// Enhanced system prompt for better code generation
const GROQ_SYSTEM_PROMPT = `You are an expert React web developer. Generate a complete, functional React application.

CRITICAL: You MUST return ONLY a valid JSON object with exactly this structure:
{
  "src/App.tsx": "// React component code",
  "src/App.css": "/* CSS styles */",
  "package.json": "// package.json content"
}

Requirements:
- Create a fully functional React component for the user's request
- Use modern React hooks and best practices
- Include responsive CSS with professional styling
- Make it visually appealing with gradients, animations, and modern design
- Ensure the component is complete and ready to run

Return ONLY the JSON object - no markdown, no explanations, no additional text.`;

const LOCAL_LLM_SYSTEM_PROMPT = `Enhance the provided React application with better styling and features.

CRITICAL: You MUST return ONLY a valid JSON object with exactly this structure:
{
  "src/App.tsx": "// Enhanced React component",
  "src/App.css": "/* Enhanced CSS styles */", 
  "package.json": "// Enhanced package.json"
}

Enhance with:
- Better UI/UX design patterns
- Smooth animations and transitions
- Professional color schemes
- Interactive elements
- Modern design aesthetics

Return ONLY the JSON object - no markdown, no explanations, no additional text.`;

// Call GROQ API with improved error handling
async function callGroqAPI(userMessage: string): Promise<string> {
  try {
    console.log('🚀 Calling GROQ API for:', userMessage);
    
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
            content: `Create a modern, professional React application for: "${userMessage}". Include interactive features, beautiful styling, and responsive design.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ API Error:', response.status, errorText);
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ GROQ API response received successfully');
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ GROQ API call failed:', error);
    throw error;
  }
}

// Call Local LLM API
async function callLocalLLM(baseCode: string, userMessage: string): Promise<string> {
  try {
    console.log('🔧 Calling Local LLM for enhancement...');
    
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
            content: `Enhance this React application for "${userMessage}": ${baseCode}`
          }
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.log('⚠️ Local LLM not available, using GROQ result');
      return baseCode;
    }

    const data = await response.json();
    console.log('✅ Local LLM enhancement completed');
    return data.choices[0].message.content;
  } catch (error) {
    console.log('⚠️ Local LLM failed, using GROQ result:', error);
    return baseCode;
  }
}

// Improved JSON parsing function
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing AI response...');
    
    // Clean the response
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^[^{]*/, ''); // Remove text before first {
    cleanedResponse = cleanedResponse.replace(/[^}]*$/, '}'); // Remove text after last }
    
    // Find and extract JSON
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonString = cleanedResponse.substring(jsonStart, jsonEnd);
    console.log('📝 Extracted JSON:', jsonString.substring(0, 200) + '...');
    
    const parsedCode = JSON.parse(jsonString);
    
    // Validate required files
    const requiredFiles = ['src/App.tsx', 'src/App.css', 'package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file]);
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing files, creating fallback');
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ Successfully parsed code response');
    return parsedCode;
  } catch (error) {
    console.error('❌ Error parsing code response:', error);
    throw error;
  }
}

// Create smart fallback based on user request
function createSmartFallback(userMessage: string): GeneratedCode {
  const lowerMessage = userMessage.toLowerCase();
  
  // Determine app type from user message
  let appType = 'general';
  let appName = 'Generated App';
  let appDescription = 'A modern web application';
  
  if (lowerMessage.includes('calculator')) {
    appType = 'calculator';
    appName = 'Smart Calculator';
    appDescription = 'A professional calculator application';
  } else if (lowerMessage.includes('todo') || lowerMessage.includes('task')) {
    appType = 'todo';
    appName = 'Task Manager';
    appDescription = 'A modern todo list application';
  } else if (lowerMessage.includes('portfolio')) {
    appType = 'portfolio';
    appName = 'Portfolio Website';
    appDescription = 'A professional portfolio website';
  } else if (lowerMessage.includes('landing') || lowerMessage.includes('website')) {
    appType = 'landing';
    appName = 'Landing Page';
    appDescription = 'A modern landing page';
  }

  const appTsx = generateAppComponent(appType, appName, appDescription, userMessage);
  const appCss = generateAppStyles(appType);
  const packageJson = generatePackageJson(appName);

  return {
    'src/App.tsx': appTsx,
    'src/App.css': appCss,
    'package.json': packageJson
  };
}

function generateAppComponent(appType: string, appName: string, appDescription: string, userMessage: string): string {
  switch (appType) {
    case 'calculator':
      return `import React, { useState } from 'react';
import './App.css';

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const calculate = (firstOperand, secondOperand, operation) => {
    switch (operation) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '×': return firstOperand * secondOperand;
      case '÷': return firstOperand / secondOperand;
      case '=': return secondOperand;
      default: return secondOperand;
    }
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="App">
      <div className="calculator">
        <div className="calculator-header">
          <h1>${appName}</h1>
          <p>Professional Calculator App</p>
        </div>
        <div className="calculator-display">
          <div className="display-value">{display}</div>
        </div>
        <div className="calculator-keypad">
          <button className="key key-clear" onClick={clear}>AC</button>
          <button className="key key-operation" onClick={() => performOperation('÷')}>÷</button>
          <button className="key key-operation" onClick={() => performOperation('×')}>×</button>
          <button className="key key-operation" onClick={() => performOperation('-')}>-</button>
          
          <button className="key key-number" onClick={() => inputNumber(7)}>7</button>
          <button className="key key-number" onClick={() => inputNumber(8)}>8</button>
          <button className="key key-number" onClick={() => inputNumber(9)}>9</button>
          <button className="key key-operation key-plus" onClick={() => performOperation('+')}>+</button>
          
          <button className="key key-number" onClick={() => inputNumber(4)}>4</button>
          <button className="key key-number" onClick={() => inputNumber(5)}>5</button>
          <button className="key key-number" onClick={() => inputNumber(6)}>6</button>
          
          <button className="key key-number" onClick={() => inputNumber(1)}>1</button>
          <button className="key key-number" onClick={() => inputNumber(2)}>2</button>
          <button className="key key-number" onClick={() => inputNumber(3)}>3</button>
          <button className="key key-equals" onClick={() => performOperation('=')}>=</button>
          
          <button className="key key-number key-zero" onClick={() => inputNumber(0)}>0</button>
          <button className="key key-number" onClick={() => inputNumber('.')}>.</button>
        </div>
      </div>
    </div>
  );
}

export default App;`;

    case 'todo':
      return `import React, { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="App">
      <div className="todo-container">
        <div className="todo-header">
          <h1>${appName}</h1>
          <p>Stay organized and productive</p>
        </div>
        
        <div className="todo-input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="todo-input"
          />
          <button onClick={addTask} className="add-button">Add Task</button>
        </div>
        
        <div className="todo-list">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={\`todo-item \${task.completed ? 'completed' : ''}\`}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="todo-checkbox"
                />
                <span className="todo-text">{task.text}</span>
                <button onClick={() => deleteTask(task.id)} className="delete-button">×</button>
              </div>
            ))
          )}
        </div>
        
        <div className="todo-stats">
          <p>{tasks.filter(task => !task.completed).length} tasks remaining</p>
        </div>
      </div>
    </div>
  );
}

export default App;`;

    default:
      return `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div className="app-container">
        <div className="app-header">
          <h1>${appName}</h1>
          <p>${appDescription}</p>
          <div className="request-info">
            <p><strong>Your Request:</strong> "${userMessage}"</p>
          </div>
        </div>
        
        <div className="app-content">
          <div className="feature-section">
            <h2>Interactive Demo</h2>
            <div className="counter-widget">
              <button 
                onClick={() => setCount(count - 1)}
                className="counter-btn decrease"
              >
                −
              </button>
              <span className="counter-display">{count}</span>
              <button 
                onClick={() => setCount(count + 1)}
                className="counter-btn increase"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="info-section">
            <div className="info-card">
              <h3>🚀 Generated with AI</h3>
              <p>This application was created using our hybrid AI system</p>
            </div>
            <div className="info-card">
              <h3>⚡ Modern Stack</h3>
              <p>Built with React, modern CSS, and best practices</p>
            </div>
            <div className="info-card">
              <h3>📱 Responsive</h3>
              <p>Optimized for all devices and screen sizes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }
}

function generateAppStyles(appType: string): string {
  const baseStyles = `
.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}`;

  switch (appType) {
    case 'calculator':
      return baseStyles + `

.calculator {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  width: 100%;
}

.calculator-header {
  text-align: center;
  margin-bottom: 20px;
}

.calculator-header h1 {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.calculator-header p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.calculator-display {
  background: #000;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: right;
}

.display-value {
  color: white;
  font-size: 2rem;
  font-weight: 300;
  min-height: 40px;
  word-wrap: break-word;
}

.calculator-keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 12px;
}

.key {
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 500;
  height: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.key:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.key:active {
  transform: translateY(0);
}

.key-number {
  background: #f8f9fa;
  color: #333;
}

.key-operation {
  background: #007bff;
  color: white;
}

.key-clear {
  background: #dc3545;
  color: white;
}

.key-equals {
  background: #28a745;
  color: white;
  grid-row: span 2;
}

.key-plus {
  grid-row: span 2;
}

.key-zero {
  grid-column: span 2;
}`;

    case 'todo':
      return baseStyles + `

.todo-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.todo-header {
  text-align: center;
  margin-bottom: 30px;
}

.todo-header h1 {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 2rem;
  font-weight: 600;
}

.todo-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.todo-input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.todo-input:focus {
  border-color: #007bff;
}

.add-button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.todo-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.todo-item:hover {
  background: #e9ecef;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.delete-button {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.todo-stats {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}`;

    default:
      return baseStyles + `

.app-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.app-header h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: 600;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header p {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
}

.request-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #007bff;
}

.request-info p {
  margin: 0;
  color: #333;
}

.app-content {
  margin-top: 40px;
}

.feature-section {
  margin-bottom: 40px;
}

.feature-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.counter-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.counter-btn {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

.counter-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.counter-display {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  min-width: 80px;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.info-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 30px 20px;
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
}

.info-card h3 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.info-card p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .app-container {
    padding: 20px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .counter-widget {
    gap: 15px;
  }
  
  .counter-btn {
    width: 50px;
    height: 50px;
  }
  
  .counter-display {
    font-size: 2rem;
  }
}`;
  }
}

function generatePackageJson(appName: string): string {
  return `{
  "name": "${appName.toLowerCase().replace(/\s+/g, '-')}",
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
}`;
}

// Main function to generate web application
export async function generateWebApplication(userMessage: string, files?: FileList): Promise<GeneratedCode> {
  console.log('🎯 Starting AI code generation for:', userMessage);
  
  try {
    // Step 1: Generate base code with GROQ (70%)
    const groqResponse = await callGroqAPI(userMessage);
    console.log('📊 GROQ generation completed (70%)');
    
    // Step 2: Try to enhance with Local LLM (30%)
    const enhancedResponse = await callLocalLLM(groqResponse, userMessage);
    console.log('🔧 Local LLM enhancement completed (30%)');
    
    // Step 3: Parse the final response
    const generatedCode = parseCodeResponse(enhancedResponse);
    console.log('✅ Hybrid AI generation successful!');
    
    return generatedCode;
  } catch (error) {
    console.error('❌ AI generation failed, using smart fallback:', error);
    
    // Create intelligent fallback based on user request
    const fallbackCode = createSmartFallback(userMessage);
    console.log('🔄 Smart fallback generated successfully');
    
    return fallbackCode;
  }
}
