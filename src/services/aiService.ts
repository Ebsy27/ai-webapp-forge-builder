
// API Configuration - hardcoded as requested
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Enhanced system prompt for proper Sandpack structure
const GROQ_SYSTEM_PROMPT = `You are an expert React web developer. Generate a complete, functional React application for Sandpack.

CRITICAL: You MUST return ONLY a valid JSON object with exactly this structure:
{
  "/src/App.js": { "code": "// React component code here" },
  "/src/index.js": { "code": "// React entry point here" },
  "/src/App.css": { "code": "/* CSS styles here */" },
  "/public/index.html": { "code": "<!-- HTML template here -->" },
  "/package.json": { "code": "// package.json content here" }
}

Requirements:
- Create a fully functional React component for the user's request
- Include proper /src/index.js that imports React, ReactDOM and mounts App to #root
- Include /public/index.html with <div id="root"></div>
- Use modern React hooks and best practices
- Include beautiful, responsive CSS with professional styling
- Make it visually appealing with gradients, animations, and modern design
- Ensure all code is properly escaped for JSON (use double quotes, escape special characters)
- The component must be complete and ready to run in Sandpack

Return ONLY the JSON object - no markdown, no explanations, no additional text.`;

const LOCAL_LLM_SYSTEM_PROMPT = `Enhance the provided React application with better styling and features for Sandpack.

CRITICAL: You MUST return ONLY a valid JSON object with exactly this structure:
{
  "/src/App.js": { "code": "// Enhanced React component" },
  "/src/index.js": { "code": "// React entry point" },
  "/src/App.css": { "code": "/* Enhanced CSS styles */" },
  "/public/index.html": { "code": "<!-- HTML template -->" },
  "/package.json": { "code": "// Enhanced package.json" }
}

Enhance with:
- Better UI/UX design patterns
- Smooth animations and transitions
- Professional color schemes
- Interactive elements
- Modern design aesthetics
- Proper JSON escaping

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
            content: `Create a modern, professional React application for: "${userMessage}". Include interactive features, beautiful styling, and responsive design. Make it lovable and engaging!`
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

// Improved JSON parsing function with better error handling
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing AI response...');
    console.log('Raw response:', response.substring(0, 500) + '...');
    
    // Clean the response more aggressively
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    
    // Remove any text before the first {
    const firstBrace = cleanedResponse.indexOf('{');
    if (firstBrace !== -1) {
      cleanedResponse = cleanedResponse.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleanedResponse.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanedResponse = cleanedResponse.substring(0, lastBrace + 1);
    }
    
    // Try to fix common JSON issues
    cleanedResponse = cleanedResponse.replace(/'/g, '"'); // Replace single quotes
    cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}'); // Remove trailing commas
    cleanedResponse = cleanedResponse.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
    
    console.log('Cleaned response:', cleanedResponse.substring(0, 300) + '...');
    
    const parsedCode = JSON.parse(cleanedResponse);
    
    // Validate the structure
    const requiredFiles = ['/src/App.js', '/src/index.js', '/src/App.css', '/public/index.html', '/package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file] || !parsedCode[file].code);
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing files in parsed response:', missingFiles);
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ Successfully parsed code response');
    console.log('Generated files:', Object.keys(parsedCode));
    return parsedCode;
  } catch (error) {
    console.error('❌ Error parsing code response:', error);
    console.log('Response that failed to parse:', response);
    throw error;
  }
}

// Create smart fallback with proper Sandpack structure
function createSmartFallback(userMessage: string): GeneratedCode {
  const lowerMessage = userMessage.toLowerCase();
  
  // Determine app type from user message
  let appConfig = {
    type: 'general',
    name: 'Generated App',
    description: 'A modern web application',
    component: generateGeneralApp(userMessage)
  };
  
  if (lowerMessage.includes('calculator')) {
    appConfig = {
      type: 'calculator',
      name: 'Smart Calculator',
      description: 'A professional calculator application',
      component: generateCalculatorApp()
    };
  } else if (lowerMessage.includes('todo') || lowerMessage.includes('task')) {
    appConfig = {
      type: 'todo',
      name: 'Task Manager',
      description: 'A modern todo list application',
      component: generateTodoApp()
    };
  } else if (lowerMessage.includes('portfolio')) {
    appConfig = {
      type: 'portfolio',
      name: 'Portfolio Website',
      description: 'A professional portfolio website',
      component: generatePortfolioApp()
    };
  }

  return {
    '/src/App.js': { code: appConfig.component },
    '/src/index.js': { code: generateIndexJs() },
    '/src/App.css': { code: generateAppCss(appConfig.type) },
    '/public/index.html': { code: generateIndexHtml(appConfig.name, appConfig.description) },
    '/package.json': { code: generatePackageJson(appConfig.name) }
  };
}

function generateIndexJs(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
}

function generateIndexHtml(appName: string, description: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${description}" />
    <title>${appName}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
}

function generateCalculatorApp(): string {
  return `import React, { useState } from 'react';

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
    <div className="calculator">
      <div className="calculator-header">
        <h1>✨ Smart Calculator</h1>
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
  );
}

export default App;`;
}

function generateTodoApp(): string {
  return `import React, { useState } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: inputValue, 
        completed: false,
        createdAt: new Date().toLocaleString()
      }]);
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

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1>📝 Task Manager</h1>
        <p>Stay organized and productive</p>
        <div className="stats">
          <span className="stat">
            {completedCount}/{totalCount} completed
          </span>
        </div>
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
        <button onClick={addTask} className="add-button">
          ➕ Add Task
        </button>
      </div>
      
      <div className="todo-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet!</h3>
            <p>Add your first task above to get started</p>
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
              <div className="todo-content">
                <span className="todo-text">{task.text}</span>
                <span className="todo-date">{task.createdAt}</span>
              </div>
              <button onClick={() => deleteTask(task.id)} className="delete-button">
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;`;
}

function generatePortfolioApp(): string {
  return `import React, { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('about');

  const projects = [
    { 
      id: 1, 
      title: "E-commerce Platform", 
      tech: "React, Node.js, MongoDB",
      description: "A full-stack e-commerce solution with payment integration",
      status: "Completed"
    },
    { 
      id: 2, 
      title: "Task Management App", 
      tech: "React, Firebase",
      description: "Real-time collaborative task management application",
      status: "In Progress"
    },
    { 
      id: 3, 
      title: "Weather Dashboard", 
      tech: "Vue.js, API Integration",
      description: "Interactive weather dashboard with location-based forecasts",
      status: "Completed"
    }
  ];

  const skills = ["React", "JavaScript", "TypeScript", "Node.js", "Python", "MongoDB", "PostgreSQL", "AWS"];

  return (
    <div className="portfolio">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>👨‍💻 John Developer</h2>
        </div>
        <div className="nav-links">
          {['about', 'projects', 'skills', 'contact'].map(section => (
            <button 
              key={section}
              className={\`nav-link \${activeSection === section ? 'active' : ''}\`}
              onClick={() => setActiveSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {activeSection === 'about' && (
          <section className="section">
            <h1>Welcome to My Portfolio 🚀</h1>
            <p className="intro">
              I'm a passionate full-stack developer with 5+ years of experience creating 
              beautiful, functional web applications. I love turning ideas into reality 
              through clean, efficient code.
            </p>
            <div className="stats">
              <div className="stat-item">
                <h3>50+</h3>
                <p>Projects Completed</p>
              </div>
              <div className="stat-item">
                <h3>5+</h3>
                <p>Years Experience</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>Client Satisfaction</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'projects' && (
          <section className="section">
            <h1>My Projects 💼</h1>
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={\`status \${project.status.toLowerCase().replace(' ', '-')}\`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    <strong>Tech Stack:</strong> {project.tech}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'skills' && (
          <section className="section">
            <h1>Skills & Technologies 🛠️</h1>
            <div className="skills-grid">
              {skills.map(skill => (
                <div key={skill} className="skill-tag">
                  {skill}
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'contact' && (
          <section className="section">
            <h1>Get In Touch 📧</h1>
            <div className="contact-info">
              <div className="contact-item">
                <h3>📧 Email</h3>
                <p>john.developer@email.com</p>
              </div>
              <div className="contact-item">
                <h3>🐙 GitHub</h3>
                <p>github.com/johndeveloper</p>
              </div>
              <div className="contact-item">
                <h3>💼 LinkedIn</h3>
                <p>linkedin.com/in/johndeveloper</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;`;
}

function generateGeneralApp(userMessage: string): string {
  return `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleIncrement = () => {
    setIsAnimating(true);
    setCount(count + 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDecrement = () => {
    setIsAnimating(true);
    setCount(count - 1);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🌟 Your Custom App</h1>
        <p>Generated from your idea: "${userMessage}"</p>
      </div>
      
      <div className="app-content">
        <div className="feature-section">
          <h2>Interactive Demo</h2>
          <div className="counter-widget">
            <button 
              onClick={handleDecrement}
              className="counter-btn decrease"
            >
              −
            </button>
            <span className={\`counter-display \${isAnimating ? 'animating' : ''}\`}>
              {count}
            </span>
            <button 
              onClick={handleIncrement}
              className="counter-btn increase"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="info-section">
          <div className="info-card">
            <div className="card-icon">🚀</div>
            <h3>Generated with AI</h3>
            <p>This application was created using our hybrid AI system</p>
          </div>
          <div className="info-card">
            <div className="card-icon">⚡</div>
            <h3>Modern Stack</h3>
            <p>Built with React, modern CSS, and best practices</p>
          </div>
          <div className="info-card">
            <div className="card-icon">📱</div>
            <h3>Responsive</h3>
            <p>Optimized for all devices and screen sizes</p>
          </div>
        </div>

        <div className="action-section">
          <button 
            onClick={() => alert('Hello! This is your custom app!')}
            className="primary-button"
          >
            Try Me! 👋
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;`;
}

function generateAppCss(appType: string): string {
  const baseStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

#root {
  width: 100%;
  max-width: 1200px;
}
`;

  if (appType === 'calculator') {
    return baseStyles + `
.calculator {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 320px;
  width: 100%;
  margin: 0 auto;
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
  } else if (appType === 'todo') {
    return baseStyles + `
.todo-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
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
  margin: 0 0 15px 0;
  font-size: 1rem;
}

.stats {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 12px;
  display: inline-block;
}

.stat {
  font-size: 0.9rem;
  color: #007bff;
  font-weight: 600;
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
  padding: 12px 20px;
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
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #333;
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

.todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.todo-text {
  font-size: 1rem;
  margin-bottom: 4px;
}

.todo-date {
  font-size: 0.8rem;
  color: #666;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 6px;
  transition: background 0.2s;
}

.delete-button:hover {
  background: rgba(220, 53, 69, 0.1);
}`;
  } else if (appType === 'portfolio') {
    return baseStyles + `
.portfolio {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

.navbar {
  background: #f8f9fa;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
}

.nav-brand h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.nav-link {
  background: none;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: #666;
}

.nav-link:hover {
  background: #e9ecef;
  color: #333;
}

.nav-link.active {
  background: #007bff;
  color: white;
}

.main-content {
  padding: 40px;
  min-height: 400px;
}

.section h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2.5rem;
}

.intro {
  font-size: 1.2rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-item h3 {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 5px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.project-card {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-5px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.project-header h3 {
  color: #333;
  font-size: 1.3rem;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.status.in-progress {
  background: #fff3cd;
  color: #856404;
}

.project-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.project-tech {
  font-size: 0.9rem;
  color: #007bff;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.skill-tag {
  background: #007bff;
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  text-align: center;
  font-weight: 500;
  transition: transform 0.2s;
}

.skill-tag:hover {
  transform: scale(1.05);
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.contact-item {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
}

.contact-item h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.contact-item p {
  color: #007bff;
  font-weight: 500;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .section h1 {
    font-size: 2rem;
  }
  
  .stats {
    grid-template-columns: 1fr;
  }
}`;
  } else {
    return baseStyles + `
.app-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
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
  margin: 0 0 40px 0;
  font-size: 1.2rem;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  border-left: 4px solid #007bff;
}

.feature-section {
  margin-bottom: 40px;
}

.feature-section h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.counter-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
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

.counter-btn:active {
  transform: translateY(-1px);
}

.counter-display {
  font-size: 3rem;
  font-weight: 700;
  color: #333;
  min-width: 100px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.counter-display.animating {
  transform: scale(1.1);
  background: #e3f2fd;
  color: #007bff;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.info-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 30px 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.info-card:hover {
  transform: translateY(-5px);
  border-color: #007bff;
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.1);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 15px;
}

.info-card h3 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.info-card p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.action-section {
  margin-top: 40px;
}

.primary-button {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
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
    font-size: 1.2rem;
  }
  
  .counter-display {
    font-size: 2rem;
    min-width: 80px;
  }
  
  .info-section {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}`;
  }
}

function generatePackageJson(appName: string): string {
  return `{
  "name": "${appName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
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
    console.log('Generated fallback files:', Object.keys(fallbackCode));
    
    return fallbackCode;
  }
}
