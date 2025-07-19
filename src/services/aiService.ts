// API Configuration - updated with new key
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Smart Website Generator System Prompt
const GROQ_SYSTEM_PROMPT = `You are AGISOL - a smart website generator that creates unique, professional websites based on user ideas. You analyze user requirements and select from 10+ distinct templates to create custom websites.

ANALYSIS PROCESS:
1. Carefully understand the user's idea: purpose, target audience, features
2. Extract key requirements: business type, industry, special features
3. Select ONE unique template from your 10+ available templates
4. Generate custom content genuinely tailored to the user's specific idea
5. Suggest relevant interactive features for the business type

AVAILABLE TEMPLATES (Select ONE based on user needs):
1. MODERN_BUSINESS - Clean corporate design with hero sections
2. CREATIVE_PORTFOLIO - Artistic showcase with gallery layouts  
3. RESTAURANT_DINING - Food industry with menu displays
4. HEALTHCARE_MEDICAL - Professional medical practice layout
5. ECOMMERCE_SHOP - Product showcase with shopping features
6. TECH_STARTUP - Modern SaaS/tech company design
7. FITNESS_GYM - Sports/wellness focused layout
8. EDUCATION_ACADEMY - Learning platform design
9. REAL_ESTATE - Property showcase layout
10. NONPROFIT_CHARITY - Community-focused design
11. CALCULATOR_APP - Functional calculator application
12. TODO_PRODUCTIVITY - Task management application

CONTENT GENERATION RULES:
- Generate UNIQUE text content for each website (no repetition)
- Create business-specific page titles and menu options
- Tailor all text to the user's specific industry/purpose
- Include relevant sections based on business type
- Add appropriate interactive features (contact forms, booking, etc.)

DESIGN REQUIREMENTS:
- Modern, responsive design with CSS Grid/Flexbox
- Professional color schemes matching the industry
- Contemporary typography (Inter, Poppins, Montserrat)
- Smooth animations and micro-interactions
- Mobile-first responsive design
- Glassmorphism effects and modern gradients

JSON STRUCTURE REQUIRED:
{
  "/src/App.js": { "code": "// Complete React application" },
  "/src/index.js": { "code": "// React entry point" },
  "/src/App.css": { "code": "/* Complete CSS styling */" },
  "/public/index.html": { "code": "<!-- HTML template -->" },
  "/package.json": { "code": "// Package configuration" }
}

CRITICAL: Return ONLY valid JSON - no markdown, no explanations, no code blocks.`;

const LOCAL_LLM_SYSTEM_PROMPT = `You are a professional web development assistant that enhances websites with advanced styling and modern features. You receive a base website code and improve it with:

1. Advanced CSS animations and transitions
2. Modern design patterns and layouts
3. Enhanced user experience elements
4. Professional color schemes and typography
5. Responsive design optimizations

Return ONLY the enhanced JSON object with the same structure as the input.`;

// Call GROQ API with enhanced website generation
async function callGroqAPI(userMessage: string): Promise<string> {
  try {
    console.log('🚀 Calling GROQ API for modern website generation:', userMessage);
    
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
            content: `AGISOL SMART GENERATOR - Create a UNIQUE website for: "${userMessage}"

🎯 MANDATORY REQUIREMENTS:
1. ANALYZE the user's request and identify the specific type of website they want
2. SELECT a DIFFERENT template each time - never repeat the same design
3. GENERATE completely UNIQUE content - no generic "Modern Business" text
4. CREATE industry-specific features and sections

📋 TEMPLATE SELECTION GUIDE:
- Restaurant/Food → Use restaurant template with menu, locations
- Portfolio/Creative → Use portfolio template with galleries, projects  
- Healthcare/Medical → Use medical template with services, appointments
- E-commerce/Shop → Use shop template with products, cart
- Calculator/Math → Use calculator app template with working buttons
- Todo/Task → Use productivity app template with task management
- Fitness/Gym → Use fitness template with classes, trainers
- Real Estate → Use property template with listings, search
- Education → Use academic template with courses, enrollment
- Nonprofit → Use charity template with donations, volunteering

🚀 CONTENT CREATION RULES:
- Extract the EXACT business name/purpose from user input
- Write SPECIFIC content for that industry (not generic business text)
- Create relevant page sections for the business type
- Include appropriate call-to-actions and features
- Use industry-appropriate terminology and language

⚠️ CRITICAL: Do NOT use generic "Modern Business" content. Make it specific to what the user actually wants!

Generate completely unique JSON response:`
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

// Call Local LLM API for enhancement
async function callLocalLLM(baseCode: string, userMessage: string): Promise<string> {
  try {
    console.log('🔧 Calling Local LLM for professional enhancement...');
    
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
            content: `Enhance this professional website for "${userMessage}" with advanced styling and features: ${baseCode}`
          }
        ],
        temperature: 0.6,
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

// Enhanced JSON parsing with better error handling
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing modern website response...');
    console.log('Raw response length:', response.length);
    console.log('First 200 chars:', response.substring(0, 200));
    
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks more aggressively
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```javascript\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^```.*$/gm, '');
    
    // Remove any leading/trailing text that's not JSON
    const firstBrace = cleanedResponse.indexOf('{');
    const lastBrace = cleanedResponse.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON object found in response');
    }
    
    cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues
    cleanedResponse = cleanedResponse.replace(/'/g, '"');
    cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}');
    cleanedResponse = cleanedResponse.replace(/,\s*]/g, ']');
    
    // Fix escaped quotes in strings
    cleanedResponse = cleanedResponse.replace(/\\"/g, '\\"');
    
    // Remove any invalid characters that might cause parsing issues
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    console.log('Cleaned response first 200 chars:', cleanedResponse.substring(0, 200));
    
    const parsedCode = JSON.parse(cleanedResponse);
    
    // Validate required files
    const requiredFiles = ['/src/App.js', '/src/index.js', '/src/App.css', '/public/index.html', '/package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file] || !parsedCode[file].code);
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing files, creating modern fallback');
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ Successfully parsed modern website');
    return parsedCode;
  } catch (error) {
    console.error('❌ Error parsing response:', error);
    console.error('Response that failed to parse:', response.substring(0, 500));
    throw error;
  }
}

// Create intelligent website fallback based on user requirements
function createIntelligentFallback(userMessage: string): GeneratedCode {
  console.log('🎨 Creating intelligent fallback website for:', userMessage);
  
  // Analyze user requirements
  let websiteConfig = analyzeRequirements(userMessage);
  
  return {
    '/src/App.js': { code: generateModernWebsite(websiteConfig) },
    '/src/index.js': { code: generateReactIndex() },
    '/src/App.css': { code: generateModernCSS(websiteConfig) },
    '/public/index.html': { code: generateModernHTML(websiteConfig) },
    '/package.json': { code: generatePackageJson(websiteConfig.name) }
  };
}

function analyzeRequirements(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Website type detection with better calculator detection
  let type = 'business';
  let sections = ['hero', 'about', 'contact'];
  let theme = 'modern';
  let industry = 'general';
  
  // Priority detection for specific applications
  if (lowerMessage.includes('calculator') || lowerMessage.includes('calculate') || lowerMessage.includes('math') || lowerMessage.includes('arithmetic')) {
    type = 'calculator';
    sections = ['calculator'];
    industry = 'utility';
  } else if (lowerMessage.includes('todo') || lowerMessage.includes('task') || lowerMessage.includes('list')) {
    type = 'todo';
    sections = ['todo'];
    industry = 'productivity';
  } else if (lowerMessage.includes('weather')) {
    type = 'weather';
    sections = ['weather'];
    industry = 'utility';
  } else if (lowerMessage.includes('portfolio')) {
    type = 'portfolio';
    sections = ['hero', 'about', 'gallery', 'skills', 'contact'];
    industry = 'creative';
  } else if (lowerMessage.includes('restaurant') || lowerMessage.includes('food')) {
    type = 'restaurant';
    sections = ['hero', 'menu', 'about', 'location', 'contact'];
    industry = 'food';
  } else if (lowerMessage.includes('healthcare') || lowerMessage.includes('clinic') || lowerMessage.includes('medical')) {
    type = 'healthcare';
    sections = ['hero', 'services', 'doctors', 'appointments', 'contact'];
    industry = 'healthcare';
  } else if (lowerMessage.includes('e-commerce') || lowerMessage.includes('shop') || lowerMessage.includes('store')) {
    type = 'ecommerce';
    sections = ['hero', 'products', 'about', 'cart', 'contact'];
    industry = 'retail';
  } else if (lowerMessage.includes('landing')) {
    type = 'landing';
    sections = ['hero', 'features', 'testimonials', 'cta'];
    industry = 'marketing';
  }
  
  // Theme detection
  if (lowerMessage.includes('dark')) theme = 'dark';
  if (lowerMessage.includes('minimal')) theme = 'minimal';
  if (lowerMessage.includes('modern')) theme = 'modern';
  
  return {
    type,
    sections,
    theme,
    industry,
    name: extractWebsiteName(userMessage),
    description: userMessage
  };
}

function extractWebsiteName(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('calculator')) return 'Modern Calculator';
  if (lowerMessage.includes('todo')) return 'Task Manager';
  if (lowerMessage.includes('weather')) return 'Weather App';
  
  const businessMatches = userMessage.match(/for\s+([A-Za-z\s]+)(?:\s+website|\s+site|\s+page)/i);
  if (businessMatches) return businessMatches[1].trim();
  
  const typeMatches = userMessage.match(/(portfolio|restaurant|clinic|shop|store|business|company)/i);
  if (typeMatches) return `Modern ${typeMatches[1].charAt(0).toUpperCase() + typeMatches[1].slice(1)}`;
  
  return 'Modern Website';
}

function generateModernWebsite(config: any): string {
  const { type } = config;
  
  if (type === 'calculator') {
    return generateCalculatorWebsite(config);
  } else if (type === 'todo') {
    return generateTodoWebsite(config);
  } else if (type === 'weather') {
    return generateWeatherWebsite(config);
  } else if (type === 'portfolio') {
    return generatePortfolioWebsite(config);
  } else if (type === 'restaurant') {
    return generateRestaurantWebsite(config);
  } else if (type === 'healthcare') {
    return generateHealthcareWebsite(config);
  } else if (type === 'ecommerce') {
    return generateEcommerceWebsite(config);
  } else if (type === 'landing') {
    return generateLandingWebsite(config);
  }
  
  return generateBusinessWebsite(config);
}

function generateCalculatorWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="calculator-container">
      <div className="calculator">
        <div className="calculator-header">
          <h1>Modern Calculator</h1>
        </div>
        
        <div className="calculator-display">
          <div className="display-screen">{display}</div>
        </div>
        
        <div className="calculator-buttons">
          <button className="btn btn-clear" onClick={clearDisplay}>
            AC
          </button>
          <button className="btn btn-operation" onClick={() => inputOperation('÷')}>
            ÷
          </button>
          <button className="btn btn-operation" onClick={() => inputOperation('×')}>
            ×
          </button>
          <button className="btn btn-operation" onClick={() => inputOperation('-')}>
            -
          </button>
          
          <button className="btn btn-number" onClick={() => inputNumber(7)}>
            7
          </button>
          <button className="btn btn-number" onClick={() => inputNumber(8)}>
            8
          </button>
          <button className="btn btn-number" onClick={() => inputNumber(9)}>
            9
          </button>
          <button className="btn btn-operation btn-plus" onClick={() => inputOperation('+')}>
            +
          </button>
          
          <button className="btn btn-number" onClick={() => inputNumber(4)}>
            4
          </button>
          <button className="btn btn-number" onClick={() => inputNumber(5)}>
            5
          </button>
          <button className="btn btn-number" onClick={() => inputNumber(6)}>
            6
          </button>
          
          <button className="btn btn-number" onClick={() => inputNumber(1)}>
            1
          </button>
          <button className="btn btn-number" onClick={() => inputNumber(2)}>
            2
          </button>
          <button className="btn btn-number" onClick={() => inputNumber(3)}>
            3
          </button>
          <button className="btn btn-equals" onClick={performCalculation}>
            =
          </button>
          
          <button className="btn btn-number btn-zero" onClick={() => inputNumber(0)}>
            0
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('.')}>
            .
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateTodoWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-container">
      <div className="todo-app">
        <h1>Task Manager</h1>
        <div className="todo-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <button onClick={addTodo}>Add</button>
        </div>
        <div className="todo-list">
          {todos.map(todo => (
            <div key={todo.id} className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateWeatherWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [weather, setWeather] = useState({
    city: 'New York',
    temperature: 22,
    condition: 'Sunny',
    humidity: 60,
    windSpeed: 15
  });

  return (
    <div className="weather-container">
      <div className="weather-app">
        <h1>Weather App</h1>
        <div className="weather-card">
          <div className="weather-main">
            <h2>{weather.city}</h2>
            <div className="temperature">{weather.temperature}°C</div>
            <div className="condition">{weather.condition}</div>
          </div>
          <div className="weather-details">
            <div className="detail-item">
              <span>Humidity</span>
              <span>{weather.humidity}%</span>
            </div>
            <div className="detail-item">
              <span>Wind Speed</span>
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateReactIndex(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
}

function generateModernCSS(config: any): string {
  const { type } = config;
  
  if (type === 'calculator') {
    return generateCalculatorCSS();
  } else if (type === 'todo') {
    return generateTodoCSS();
  } else if (type === 'weather') {
    return generateWeatherCSS();
  }
  
  return generateBusinessCSS(config);
}

function generateCalculatorCSS(): string {
  return `/* Modern Calculator Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calculator-container {
  padding: 20px;
}

.calculator {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.calculator-header h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 700;
}

.calculator-display {
  background: #1a1a1a;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.display-screen {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  text-align: right;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  word-break: break-all;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.btn {
  border: none;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-number {
  background: #f8f9fa;
  color: #333;
}

.btn-number:hover {
  background: #e9ecef;
}

.btn-operation {
  background: #667eea;
  color: white;
}

.btn-operation:hover {
  background: #5a6fd8;
}

.btn-clear {
  background: #ff6b6b;
  color: white;
}

.btn-clear:hover {
  background: #ff5252;
}

.btn-equals {
  background: #51cf66;
  color: white;
  grid-row: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-equals:hover {
  background: #40c057;
}

.btn-zero {
  grid-column: span 2;
}

.btn-plus {
  grid-row: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 480px) {
  .calculator {
    margin: 20px;
    padding: 20px;
  }
  
  .btn {
    padding: 15px;
    font-size: 1.2rem;
  }
  
  .display-screen {
    font-size: 2rem;
  }
}`;
}

function generateTodoCSS(): string {
  return `/* Modern Todo App Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.todo-container {
  max-width: 600px;
  margin: 0 auto;
  padding-top: 50px;
}

.todo-app {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.todo-app h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 700;
}

.todo-input {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.todo-input input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 15px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.todo-input input:focus {
  outline: none;
  border-color: #667eea;
}

.todo-input button {
  background: #667eea;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.todo-input button:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 15px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.todo-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed span {
  text-decoration: line-through;
}

.todo-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-item span {
  flex: 1;
  font-size: 1.1rem;
  color: #333;
}

.todo-item button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.todo-item button:hover {
  background: #ff5252;
}`;
}

function generateWeatherCSS(): string {
  return `/* Modern Weather App Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-container {
  padding: 20px;
}

.weather-app {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.weather-app h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 2rem;
  font-weight: 700;
}

.weather-card {
  text-align: center;
}

.weather-main h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.temperature {
  font-size: 4rem;
  font-weight: 300;
  color: #0984e3;
  margin-bottom: 10px;
}

.condition {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 30px;
}

.weather-details {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.detail-item span:first-child {
  color: #666;
  font-size: 0.9rem;
}

.detail-item span:last-child {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}`;
}

function generateBusinessCSS(config: any): string {
  return `/* Modern CSS for ${config.name} */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fff;
}

/* Modern Container */
.modern-container, .restaurant-container, .healthcare-container, .ecommerce-container, .landing-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #667eea;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  min-height: 100vh;
}

.hero-text {
  color: white;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  background: #fff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

/* Sections */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #666;
}

/* Grid Layouts */
.services-grid, .features-grid, .products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

/* Cards */
.service-card, .feature-card, .product-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-align: center;
}

.service-card:hover, .feature-card:hover, .product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.service-icon, .feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Forms */
.contact-form, .appointment-form {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-input, .form-textarea {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .nav-menu {
    gap: 1rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-text, .service-card, .feature-card {
  animation: fadeInUp 0.6s ease forwards;
}`;
}

function generateModernHTML(config: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
}

function generatePackageJson(siteName: string): string {
  return `{
  "name": "${siteName.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;
}

// Create intelligent website fallback based on user requirements
function generateBusinessWebsite(config: any): string {
  return `import React, { useState, useEffect } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="modern-container">
      <nav className={\`navbar \${isScrolled ? 'scrolled' : ''}\`}>
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Transform Your Business with ${config.name}</h1>
            <p className="hero-subtitle">Experience excellence in modern business solutions designed for today's digital world</p>
            <div className="hero-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">About Our Company</h2>
            <p className="section-subtitle">Building the future, one solution at a time</p>
          </div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle">Comprehensive solutions for modern businesses</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💼</div>
              <h3>Business Consulting</h3>
              <p>Strategic guidance to accelerate your business growth</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Digital Solutions</h3>
              <p>Custom technology solutions for your business needs</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>Marketing Services</h3>
              <p>Data-driven marketing strategies to expand your reach</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">Let's discuss your project</p>
          </div>
          <form className="contact-form">
            <div className="form-row">
              <input type="text" placeholder="Your Name" className="form-input" required />
              <input type="email" placeholder="Your Email" className="form-input" required />
            </div>
            <textarea placeholder="Your Message" className="form-textarea" rows="5" required></textarea>
            <button type="submit" className="btn-primary">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generatePortfolioWebsite(config: any): string {
  return `import React from 'react';

function App() {
  return (
    <div className="modern-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#portfolio" className="nav-link">Portfolio</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Creative Portfolio</h1>
            <p className="hero-subtitle">Showcasing innovative designs and creative solutions</p>
            <div className="hero-buttons">
              <button className="btn-primary">View Work</button>
              <button className="btn-secondary">Contact Me</button>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">About Me</h2>
            <p className="section-subtitle">Creative professional with passion for design</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateRestaurantWebsite(config: any): string {
  return `import React from 'react';

function App() {
  return (
    <div className="restaurant-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#menu" className="nav-link">Menu</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to ${config.name}</h1>
            <p className="hero-subtitle">An unforgettable culinary experience awaits</p>
            <div className="hero-buttons">
              <button className="btn-primary">View Menu</button>
              <button className="btn-secondary">Book Table</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateHealthcareWebsite(config: any): string {
  return `import React from 'react';

function App() {
  return (
    <div className="healthcare-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#doctors" className="nav-link">Doctors</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your Health, Our Priority</h1>
            <p className="hero-subtitle">Comprehensive healthcare with compassion</p>
            <div className="hero-buttons">
              <button className="btn-primary">Book Appointment</button>
              <button className="btn-secondary">Our Services</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateEcommerceWebsite(config: any): string {
  return `import React from 'react';

function App() {
  return (
    <div className="ecommerce-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#products" className="nav-link">Products</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Shop Premium Products</h1>
            <p className="hero-subtitle">Discover quality products at unbeatable prices</p>
            <div className="hero-buttons">
              <button className="btn-primary">Shop Now</button>
              <button className="btn-secondary">View Collections</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateLandingWebsite(config: any): string {
  return `import React from 'react';

function App() {
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#pricing" className="nav-link">Pricing</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Transform Your Business</h1>
            <p className="hero-subtitle">The ultimate solution for modern businesses</p>
            <div className="hero-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

// Smart load balancing: 70% GROQ, 30% Local LLM
export async function generateWebsite(userMessage: string): Promise<GeneratedCode> {
  try {
    console.log('🌟 Starting AGISOL smart website generation...');
    
    // Smart load balancing with randomization
    const useGroqFirst = Math.random() < 0.7; // 70% chance for GROQ
    
    if (useGroqFirst) {
      try {
        console.log('📡 Using GROQ API (70% probability)');
        const groqResponse = await callGroqAPI(userMessage);
        const parsedCode = parseCodeResponse(groqResponse);
        
        // Try to enhance with Local LLM (30% chance)
        if (Math.random() < 0.3) {
          console.log('🔧 Enhancing with Local LLM');
          const enhancedResponse = await callLocalLLM(JSON.stringify(parsedCode), userMessage);
          try {
            const enhancedCode = parseCodeResponse(enhancedResponse);
            console.log('✅ Enhanced website generated successfully');
            return enhancedCode;
          } catch {
            console.log('⚠️ Enhancement failed, using GROQ result');
            return parsedCode;
          }
        }
        
        console.log('✅ GROQ website generated successfully');
        return parsedCode;
      } catch (error) {
        console.log('⚠️ GROQ failed, trying Local LLM fallback');
        return await tryLocalLLMGeneration(userMessage);
      }
    } else {
      console.log('🏠 Using Local LLM first (30% probability)');
      return await tryLocalLLMGeneration(userMessage);
    }
  } catch (error) {
    console.error('❌ All generation methods failed, using intelligent fallback:', error);
    return createIntelligentFallback(userMessage);
  }
}

async function tryLocalLLMGeneration(userMessage: string): Promise<GeneratedCode> {
  try {
    // Create a base template first
    const baseTemplate = createIntelligentFallback(userMessage);
    const localResponse = await callLocalLLM(JSON.stringify(baseTemplate), userMessage);
    const parsedCode = parseCodeResponse(localResponse);
    console.log('✅ Local LLM website generated successfully');
    return parsedCode;
  } catch (error) {
    console.log('⚠️ Local LLM failed, using intelligent fallback');
    return createIntelligentFallback(userMessage);
  }
}
