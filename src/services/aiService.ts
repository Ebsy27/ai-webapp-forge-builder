import { ENHANCED_SYSTEM_PROMPT, generateEnhancedPrompt, analyzeUserInput } from './enhanced/promptTemplates';
import { checkCodeQuality, enhanceCodeQuality } from './enhanced/codeQualityChecker';

// API Configuration
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Type guard to check if an object has the expected FileContent structure
function isFileContent(obj: unknown): obj is { code: string } {
  return typeof obj === 'object' && obj !== null && 'code' in obj && typeof (obj as any).code === 'string';
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
        model: 'llama3-70b-8192', // Using larger model for better understanding
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
        temperature: 0.1, // Lower temperature for more consistent JSON output
        max_tokens: 8000, // Increased for more detailed responses
        top_p: 0.8,
        frequency_penalty: 0.2,
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
    
    if (retryCount < 2 && (error instanceof Error && (error.message.includes('network') || error.message.includes('timeout')))) {
      console.log('🔄 Retrying GROQ API call...');
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return callGroqAPI(userMessage, retryCount + 1);
    }
    
    throw error;
  }
}

// Enhanced JSON parsing with aggressive cleaning
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing enhanced website response...');
    console.log('Raw response length:', response.length);
    
    let cleanedResponse = response.trim();
    
    // Remove any text before the JSON object
    const jsonStart = cleanedResponse.indexOf('{');
    if (jsonStart > 0) {
      cleanedResponse = cleanedResponse.substring(jsonStart);
    }
    
    // Remove any text after the JSON object
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    if (jsonEnd > 0) {
      cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
    }
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```javascript\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^```.*$/gm, '');
    
    // Fix common JSON issues
    cleanedResponse = cleanedResponse.replace(/'/g, '"'); // Replace single quotes
    cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}'); // Remove trailing commas
    cleanedResponse = cleanedResponse.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
    
    // Fix double-encoded JSON strings - this is the main issue
    cleanedResponse = cleanedResponse.replace(/"code":\s*"\\?"([^"]*(?:\\.[^"]*)*)"\\?"/g, (match, content) => {
      // Properly unescape the content
      const unescapedContent = content
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      
      // Re-escape for JSON
      const reescapedContent = unescapedContent
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      return `"code": "${reescapedContent}"`;
    });
    
    // Remove template literals and fix backticks
    cleanedResponse = cleanedResponse.replace(/`([^`]*)`/g, (match, content) => {
      const escapedContent = content
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      return `"${escapedContent}"`;
    });
    
    // Remove invalid control characters
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Validate JSON before parsing
    console.log('🧹 Cleaned response preview:', cleanedResponse.substring(0, 500) + '...');
    
    try {
      JSON.parse(cleanedResponse);
    } catch (jsonError) {
      console.error('❌ JSON validation failed:', jsonError);
      console.error('Invalid JSON segment:', cleanedResponse.substring(0, 1000));
      throw new Error(`Invalid JSON structure: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
    }
    
    const parsedCode = JSON.parse(cleanedResponse);
    
    // Validate required files
    const requiredFiles = ['/src/App.js', '/src/index.js', '/src/App.css', '/public/index.html', '/package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file] || !isFileContent(parsedCode[file]));
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing required files:', missingFiles);
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    // Validate code content with proper type checking
    Object.entries(parsedCode).forEach(([filepath, fileContent]) => {
      if (!isFileContent(fileContent) || fileContent.code.trim().length === 0) {
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
  
  const analysis = analyzeUserInput(userMessage);
  console.log('📋 Website analysis:', analysis);
  
  const websiteConfig = {
    type: analysis.websiteType,
    name: extractWebsiteName(userMessage, analysis.websiteType),
    industry: analysis.industry,
    features: analysis.keyFeatures,
    sections: analysis.sections
  };
  
  return {
    '/src/App.js': { code: generateSpecificWebsite(websiteConfig) },
    '/src/index.js': { code: generateReactIndex() },
    '/src/App.css': { code: generateModernCSS(websiteConfig) },
    '/public/index.html': { code: generateModernHTML(websiteConfig) },
    '/package.json': { code: generatePackageJson(websiteConfig.name) }
  };
}

function extractWebsiteName(userMessage: string, websiteType: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Type-specific names
  const typeNames = {
    'ecommerce': 'Premium Store',
    'restaurant': 'Gourmet Restaurant',
    'portfolio': 'Creative Portfolio',
    'healthcare': 'Health Clinic',
    'business': 'Business Solutions',
    'landing': 'Product Landing'
  };
  
  // Extract business name from patterns
  const businessMatches = userMessage.match(/for\s+([A-Za-z\s]+)(?:\s+website|\s+site)/i);
  if (businessMatches) return businessMatches[1].trim();
  
  return typeNames[websiteType] || 'Modern Website';
}

// Generate specific websites based on type with images
function generateSpecificWebsite(config: any): string {
  const { type } = config;
  
  switch (type) {
    case 'ecommerce':
      return generateEcommerceWebsite(config);
    case 'restaurant':
      return generateRestaurantWebsite(config);
    case 'portfolio':
      return generatePortfolioWebsite(config);
    case 'healthcare':
      return generateHealthcareWebsite(config);
    case 'landing':
      return generateLandingWebsite(config);
    default:
      return generateBusinessWebsite(config);
  }
}

function generateEcommerceWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [cart, setCart] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: 'Premium Sneaker',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
      category: 'Footwear'
    },
    {
      id: 2,
      name: 'Designer Watch',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
      category: 'Accessories'
    },
    {
      id: 3,
      name: 'Wireless Headphones',
      price: 159.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
      category: 'Electronics'
    },
    {
      id: 4,
      name: 'Leather Jacket',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop',
      category: 'Clothing'
    }
  ];

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Date.now() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div className="ecommerce-store">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">${config.name}</h1>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => setActiveSection('home')}>Home</a></li>
            <li><a href="#products" onClick={() => setActiveSection('products')}>Products</a></li>
            <li><a href="#about" onClick={() => setActiveSection('about')}>About</a></li>
            <li><a href="#contact" onClick={() => setActiveSection('contact')}>Contact</a></li>
            <li className="cart-icon" onClick={() => setActiveSection('cart')}>
              Cart ({cart.length}) - $\{cartTotal.toFixed(2)}
            </li>
          </ul>
        </div>
      </nav>

      {activeSection === 'home' && (
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Discover Premium Products</h1>
              <p className="hero-subtitle">Shop the latest trends with unmatched quality and style</p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => setActiveSection('products')}>
                  Shop Now
                </button>
                <button className="btn-secondary">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop" alt="Shopping" />
            </div>
          </div>
        </section>
      )}

      {activeSection === 'products' && (
        <section className="products-section">
          <div className="container">
            <h2 className="section-title">Our Products</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="product-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
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

      {activeSection === 'cart' && (
        <section className="cart-section">
          <div className="container">
            <h2 className="section-title">Shopping Cart</h2>
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.cartId} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>$\{item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)}>Remove</button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Total: $\{cartTotal.toFixed(2)}</h3>
                  <button className="checkout-btn">Proceed to Checkout</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'about' && (
        <section className="about-section">
          <div className="container">
            <h2 className="section-title">About Us</h2>
            <div className="about-content">
              <img src="https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop" alt="About us" />
              <div className="about-text">
                <p>We are passionate about bringing you the finest products with exceptional quality and unmatched customer service.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'contact' && (
        <section className="contact-section">
          <div className="container">
            <h2 className="section-title">Contact Us</h2>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" className="form-input" required />
              <input type="email" placeholder="Your Email" className="form-input" required />
              <textarea placeholder="Your Message" className="form-textarea" required></textarea>
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
  return `/* Modern Dark Theme CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  line-height: 1.6;
  min-height: 100vh;
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
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
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
  cursor: pointer;
}

.nav-menu a:hover {
  color: #4ecdc4;
}

.cart-icon {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
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
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
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
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(78, 205, 196, 0.3);
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

.hero-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(78, 205, 196, 0.2);
}

/* Sections */
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
  background: linear-gradient(45deg, #ffffff, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.products-section,
.cart-section,
.about-section,
.contact-section {
  padding: 6rem 0;
  min-height: 100vh;
}

/* Search */
.search-container {
  text-align: center;
  margin-bottom: 3rem;
}

.search-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 1rem 2rem;
  color: #ffffff;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.2);
}

/* Product Grid */
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
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-info {
  padding: 1.5rem;
}

.product-category {
  color: #4ecdc4;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
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
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
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
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
}

/* Cart */
.cart-items {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(20px);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
}

.item-details {
  flex: 1;
}

.cart-item button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}

.cart-total {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.checkout-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.empty-cart {
  text-align: center;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 4rem 0;
}

/* About Section */
.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-content img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 20px;
}

.about-text {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
}

/* Contact Form */
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.2);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content,
  .about-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .nav-menu {
    gap: 1rem;
    font-size: 0.9rem;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    flex-direction: column;
    text-align: center;
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
  background-clip: text;
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
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(78, 205, 196, 0.3);
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
