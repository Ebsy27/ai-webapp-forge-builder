import { ENHANCED_SYSTEM_PROMPT, generateEnhancedPrompt, analyzeUserInput } from './enhanced/promptTemplates';
import { checkCodeQuality, enhanceCodeQuality } from './enhanced/codeQualityChecker';

// API Configuration - updated with new key
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Enhanced API call with better error handling and retry logic
async function callGroqAPI(userMessage: string, retryCount = 0): Promise<string> {
  try {
    console.log(`🚀 Calling Enhanced GROQ API (attempt ${retryCount + 1}) for:`, userMessage);
    
    const requirements = analyzeUserInput(userMessage);
    const enhancedPrompt = generateEnhancedPrompt(userMessage, requirements);
    
    console.log('📝 Enhanced prompt generated with requirements:', requirements);
    
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
            content: ENHANCED_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.3, // Reduced for more consistent output
        max_tokens: 6000, // Increased for more detailed responses
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ API Error:', response.status, errorText);
      throw new Error(`GROQ API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('✅ Enhanced GROQ API response received, length:', content.length);
    console.log('📄 Response preview:', content.substring(0, 300) + '...');
    
    return content;
  } catch (error) {
    console.error(`❌ Enhanced GROQ API call failed (attempt ${retryCount + 1}):`, error);
    
    // Retry logic for network errors
    if (retryCount < 2 && (error.message.includes('network') || error.message.includes('timeout'))) {
      console.log('🔄 Retrying GROQ API call...');
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return callGroqAPI(userMessage, retryCount + 1);
    }
    
    throw error;
  }
}

// Enhanced JSON parsing with better error handling
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing enhanced website response...');
    console.log('Raw response length:', response.length);
    
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks and any wrapper text
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```javascript\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^```.*$/gm, '');
    
    // Find the JSON object boundaries
    const firstBrace = cleanedResponse.indexOf('{');
    const lastBrace = cleanedResponse.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON object found in response');
    }
    
    cleanedResponse = cleanedResponse.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON formatting issues
    cleanedResponse = cleanedResponse.replace(/'/g, '"');
    cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}');
    cleanedResponse = cleanedResponse.replace(/,\s*]/g, ']');
    
    // Fix template literal issues - replace backticks with proper JSON strings
    cleanedResponse = cleanedResponse.replace(/`([^`]*)`/g, (match, content) => {
      // Escape quotes and newlines in template literals
      const escapedContent = content
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${escapedContent}"`;
    });
    
    // Remove any remaining invalid characters
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    console.log('🧹 Cleaned response preview:', cleanedResponse.substring(0, 500) + '...');
    
    // Validate JSON structure before parsing
    try {
      JSON.parse(cleanedResponse);
    } catch (jsonError) {
      console.error('❌ JSON validation failed:', jsonError);
      console.error('Invalid JSON segment:', cleanedResponse.substring(0, 1000));
      throw new Error(`Invalid JSON structure: ${jsonError.message}`);
    }
    
    const parsedCode = JSON.parse(cleanedResponse);
    
    // Validate required files
    const requiredFiles = ['/src/App.js', '/src/index.js', '/src/App.css', '/public/index.html', '/package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file] || !parsedCode[file].code);
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing required files:', missingFiles);
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    // Validate code content
    Object.entries(parsedCode).forEach(([filepath, fileContent]) => {
      if (!fileContent || typeof fileContent.code !== 'string' || fileContent.code.trim().length === 0) {
        throw new Error(`Invalid or empty code content for file: ${filepath}`);
      }
    });
    
    console.log('✅ Successfully parsed and validated enhanced website');
    console.log('📁 Generated files:', Object.keys(parsedCode));
    
    return parsedCode;
  } catch (error) {
    console.error('❌ Error parsing response:', error);
    console.error('Response that failed to parse:', response.substring(0, 500) + '...');
    throw error;
  }
}

// Create intelligent website fallback based on user requirements
function createIntelligentFallback(userMessage: string): GeneratedCode {
  console.log('🎨 Creating intelligent fallback website for:', userMessage);
  
  const websiteConfig = analyzeRequirements(userMessage);
  console.log('📋 Website configuration:', websiteConfig);
  
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
  
  let type = 'business';
  let sections = ['hero', 'about', 'contact'];
  let theme = 'modern';
  let industry = 'general';
  
  // Enhanced detection logic
  if (lowerMessage.includes('calculator') || lowerMessage.includes('math')) {
    type = 'calculator';
    sections = ['calculator'];
    industry = 'utility';
  } else if (lowerMessage.includes('todo') || lowerMessage.includes('task')) {
    type = 'todo';
    sections = ['todo'];
    industry = 'productivity';
  } else if (lowerMessage.includes('e-commerce') || lowerMessage.includes('shop') || lowerMessage.includes('store') || lowerMessage.includes('sneaker')) {
    type = 'ecommerce';
    sections = ['hero', 'products', 'about', 'cart', 'contact'];
    industry = 'retail';
  } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('creative')) {
    type = 'portfolio';
    sections = ['hero', 'about', 'gallery', 'skills', 'contact'];
    industry = 'creative';
  } else if (lowerMessage.includes('restaurant') || lowerMessage.includes('food')) {
    type = 'restaurant';
    sections = ['hero', 'menu', 'about', 'location', 'contact'];
    industry = 'food';
  } else if (lowerMessage.includes('healthcare') || lowerMessage.includes('clinic')) {
    type = 'healthcare';
    sections = ['hero', 'services', 'doctors', 'appointments', 'contact'];
    industry = 'healthcare';
  }
  
  return {
    type,
    sections,
    theme: 'dark', // Always use dark theme as requested
    industry,
    name: extractWebsiteName(userMessage),
    description: userMessage
  };
}

function extractWebsiteName(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('sneaker')) return 'Premium Sneaker Store';
  if (lowerMessage.includes('calculator')) return 'Modern Calculator';
  if (lowerMessage.includes('todo')) return 'Task Manager';
  
  const businessMatches = userMessage.match(/for\s+([A-Za-z\s]+)(?:\s+website|\s+site)/i);
  if (businessMatches) return businessMatches[1].trim();
  
  return 'Modern Website';
}

// Generate modern websites based on type
function generateModernWebsite(config: any): string {
  const { type } = config;
  
  if (type === 'ecommerce') {
    return generateEcommerceWebsite(config);
  } else if (type === 'calculator') {
    return generateCalculatorWebsite(config);
  } else if (type === 'todo') {
    return generateTodoWebsite(config);
  }
  
  return generateBusinessWebsite(config);
}

function generateEcommerceWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [cart, setCart] = useState([]);
  const [activeSection, setActiveSection] = useState('home');

  const products = [
    {
      id: 1,
      name: 'Air Force Elite',
      price: 199.99,
      image: '/api/placeholder/300/300',
      category: 'Basketball'
    },
    {
      id: 2,
      name: 'Street Runner Pro',
      price: 159.99,
      image: '/api/placeholder/300/300',
      category: 'Running'
    },
    {
      id: 3,
      name: 'Urban Classic',
      price: 129.99,
      image: '/api/placeholder/300/300',
      category: 'Lifestyle'
    },
    {
      id: 4,
      name: 'Court Master',
      price: 179.99,
      image: '/api/placeholder/300/300',
      category: 'Basketball'
    }
  ];

  const addToCart = (product) => {
    setCart([...cart, { ...product, id: Date.now() }]);
  };

  return (
    <div className="sneaker-store">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">SNEAKER ELITE</h1>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => setActiveSection('home')}>Home</a></li>
            <li><a href="#products" onClick={() => setActiveSection('products')}>Products</a></li>
            <li><a href="#about" onClick={() => setActiveSection('about')}>About</a></li>
            <li><a href="#contact" onClick={() => setActiveSection('contact')}>Contact</a></li>
            <li className="cart-icon">
              Cart ({cart.length})
            </li>
          </ul>
        </div>
      </nav>

      {activeSection === 'home' && (
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Step Into Excellence</h1>
              <p className="hero-subtitle">Discover premium sneakers that define your style and elevate your game</p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => setActiveSection('products')}>
                  Shop Collection
                </button>
                <button className="btn-secondary">
                  Watch Story
                </button>
              </div>
            </div>
            <div className="hero-image">
              <div className="sneaker-showcase">
                <div className="featured-sneaker"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'products' && (
        <section className="products-section">
          <div className="container">
            <h2 className="section-title">Premium Collection</h2>
            <div className="product-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <div className="product-placeholder"></div>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">$\{product.price}</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'about' && (
        <section className="about-section">
          <div className="container">
            <h2 className="section-title">About Sneaker Elite</h2>
            <p className="about-text">
              We are passionate about bringing you the finest sneakers from around the world. 
              Our curated collection features premium brands and exclusive designs.
            </p>
          </div>
        </section>
      )}

      {activeSection === 'contact' && (
        <section className="contact-section">
          <div className="container">
            <h2 className="section-title">Get In Touch</h2>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" className="form-input" />
              <input type="email" placeholder="Your Email" className="form-input" />
              <textarea placeholder="Your Message" className="form-textarea"></textarea>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;`;
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
  
  if (type === 'ecommerce') {
    return generateEcommerceCSS();
  } else if (type === 'calculator') {
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

function generateEcommerceCSS(): string {
  return `/* Premium Sneaker Store - Dark Theme */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a0a;
  color: #ffffff;
  line-height: 1.6;
}

.sneaker-store {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  z-index: 1000;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}

.nav-menu a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-menu a:hover {
  color: #4ecdc4;
}

.nav-menu a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -5px;
  left: 0;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  transition: width 0.3s ease;
}

.nav-menu a:hover::after {
  width: 100%;
}

.cart-icon {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  color: #ffffff !important;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cart-icon:hover {
  transform: translateY(-2px);
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 80px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%);
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #ffffff, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.2);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #4ecdc4;
  border: 2px solid #4ecdc4;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #4ecdc4;
  color: #0a0a0a;
  transform: translateY(-3px);
}

.sneaker-showcase {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-sneaker {
  width: 300px;
  height: 200px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 20px;
  position: relative;
  transform: rotate(-15deg);
  box-shadow: 0 20px 60px rgba(78, 205, 196, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: rotate(-15deg) translateY(0px); }
  50% { transform: rotate(-15deg) translateY(-20px); }
}

/* Products Section */
.products-section {
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(45deg, #ffffff, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.product-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(78, 205, 196, 0.2);
}

.product-image {
  height: 250px;
  position: relative;
  overflow: hidden;
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  opacity: 0.1;
}

.product-info {
  padding: 1.5rem;
}

.product-category {
  color: #4ecdc4;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: #ffffff;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4ecdc4;
  margin-bottom: 1rem;
}

.add-to-cart-btn {
  width: 100%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
}

/* About & Contact Sections */
.about-section, .contact-section {
  padding: 6rem 0;
  text-align: center;
}

.about-text {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input, .form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.2);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
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
  
  .nav-menu {
    gap: 1rem;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}`;
}

function generateBusinessCSS(config: any): string {
  return `/* Modern Dark Theme CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0a0a0a;
  color: #ffffff;
  line-height: 1.6;
}

.modern-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  z-index: 1000;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4ecdc4;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-menu a:hover {
  color: #4ecdc4;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: 80px;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #ffffff, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #4ecdc4;
  border: 2px solid #4ecdc4;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #4ecdc4;
  color: #0a0a0a;
}

/* Sections */
.about-section, .services-section, .contact-section {
  padding: 6rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}`;
}

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

function generateModernHTML(config: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <meta name="description" content="Modern ${config.type} website with premium design and functionality">
    <meta name="keywords" content="${config.industry}, modern, premium, ${config.type}">
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

// Main API function with enhanced error handling
export async function generateWebsite(userMessage: string): Promise<GeneratedCode> {
  try {
    console.log('🌟 Starting enhanced website generation process...');
    console.log('📝 User request:', userMessage);
    
    // Try GROQ API first with enhanced prompts
    const groqResponse = await callGroqAPI(userMessage);
    
    try {
      // Parse the response with enhanced error handling
      let parsedCode = parseCodeResponse(groqResponse);
      
      // Check code quality and enhance if needed
      const qualityCheck = checkCodeQuality(parsedCode);
      console.log(`📊 Code quality score: ${qualityCheck.score}/100`);
      
      if (qualityCheck.score < 70) {
        console.log('⚠️ Code quality below threshold, enhancing...');
        parsedCode = enhanceCodeQuality(parsedCode);
      }
      
      console.log('✅ Enhanced website generation completed successfully');
      return parsedCode;
    } catch (parseError) {
      console.log('⚠️ GROQ response parsing failed, creating intelligent fallback');
      console.error('Parse error details:', parseError);
      return createIntelligentFallback(userMessage);
    }
  } catch (error) {
    console.error('❌ Enhanced website generation failed, creating intelligent fallback:', error);
    return createIntelligentFallback(userMessage);
  }
}
