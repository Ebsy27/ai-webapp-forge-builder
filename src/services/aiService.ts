// API Configuration - hardcoded as requested
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Enhanced system prompt for professional website generation
const GROQ_SYSTEM_PROMPT = `You are an expert web developer specializing in creating professional, modern websites. Generate a complete, functional React application for Sandpack based on user requirements.

CRITICAL: You MUST return ONLY a valid JSON object with exactly this structure:
{
  "/src/App.js": { "code": "// React component code here" },
  "/src/index.js": { "code": "// React entry point here" },
  "/src/App.css": { "code": "/* CSS styles here */" },
  "/public/index.html": { "code": "<!-- HTML template here -->" },
  "/package.json": { "code": "// package.json content here" }
}

DESIGN REQUIREMENTS:
- Use modern, elegant themes with professional appearance
- Apply stylish, readable fonts and visually appealing layouts
- Structure with clear navigation, well-defined sections, balanced spacing
- Add subtle UI elements: smooth hover effects, soft shadows, gradients
- Ensure full responsiveness for desktop and mobile devices
- Use modern color schemes and professional typography

CONTENT ADAPTATION:
- Tailor content, features, and sections to user's specific request
- Create unique designs (no generic templates)
- Make navigation and buttons easily visible and accessible
- Include relevant sections based on website type (hero, about, services, gallery, contact, etc.)

TECHNICAL REQUIREMENTS:
- Use React hooks and modern JavaScript
- Include professional CSS with animations and transitions
- Ensure proper HTML structure and semantic elements
- Make code clean, maintainable, and production-ready
- Escape all code properly for JSON format

Return ONLY the JSON object - no markdown, no explanations, no additional text.`;

const LOCAL_LLM_SYSTEM_PROMPT = `Enhance the provided React website with advanced styling and professional features.

CRITICAL: You MUST return ONLY a valid JSON object with the same structure.

ENHANCEMENT FOCUS:
- Improve UI/UX design patterns and visual hierarchy
- Add sophisticated animations and micro-interactions  
- Implement professional color schemes and typography
- Enhance responsive design and accessibility
- Add modern design elements and visual polish
- Optimize code structure and performance

Return ONLY the JSON object - no markdown, no explanations, no additional text.`;

// Call GROQ API with enhanced website generation
async function callGroqAPI(userMessage: string): Promise<string> {
  try {
    console.log('🚀 Calling GROQ API for professional website generation:', userMessage);
    
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
            content: `Create a professional, modern website for: "${userMessage}". 

REQUIREMENTS ANALYSIS:
1. Understand the purpose, target audience, and industry
2. Design appropriate sections and features
3. Apply modern, professional styling
4. Ensure responsive design and accessibility
5. Create engaging, interactive elements

Generate a complete, production-ready website that exceeds expectations!`
          }
        ],
        temperature: 0.8,
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
    console.log('🔍 Parsing professional website response...');
    
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    
    // Extract JSON object
    const firstBrace = cleanedResponse.indexOf('{');
    if (firstBrace !== -1) {
      cleanedResponse = cleanedResponse.substring(firstBrace);
    }
    
    const lastBrace = cleanedResponse.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleanedResponse = cleanedResponse.substring(0, lastBrace + 1);
    }
    
    // Fix common JSON issues
    cleanedResponse = cleanedResponse.replace(/'/g, '"');
    cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}');
    cleanedResponse = cleanedResponse.replace(/,\s*]/g, ']');
    
    const parsedCode = JSON.parse(cleanedResponse);
    
    // Validate required files
    const requiredFiles = ['/src/App.js', '/src/index.js', '/src/App.css', '/public/index.html', '/package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file] || !parsedCode[file].code);
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing files, creating professional fallback');
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ Successfully parsed professional website');
    return parsedCode;
  } catch (error) {
    console.error('❌ Error parsing response, creating intelligent fallback:', error);
    throw error;
  }
}

// Create intelligent website fallback based on user requirements
function createIntelligentFallback(userMessage: string): GeneratedCode {
  const lowerMessage = userMessage.toLowerCase();
  
  // Analyze user requirements
  let websiteConfig = analyzeRequirements(userMessage);
  
  return {
    '/src/App.js': { code: generateProfessionalWebsite(websiteConfig) },
    '/src/index.js': { code: generateReactIndex() },
    '/src/App.css': { code: generateProfessionalCSS(websiteConfig) },
    '/public/index.html': { code: generateProfessionalHTML(websiteConfig) },
    '/package.json': { code: generatePackageJson(websiteConfig.name) }
  };
}

function analyzeRequirements(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Website type detection
  let type = 'business';
  let sections = ['hero', 'about', 'contact'];
  let theme = 'light';
  let industry = 'general';
  
  if (lowerMessage.includes('portfolio')) {
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
  const businessMatches = userMessage.match(/for\s+([A-Za-z\s]+)(?:\s+website|\s+site|\s+page)/i);
  if (businessMatches) return businessMatches[1].trim();
  
  const typeMatches = userMessage.match(/(portfolio|restaurant|clinic|shop|store|business|company)/i);
  if (typeMatches) return `Professional ${typeMatches[1].charAt(0).toUpperCase() + typeMatches[1].slice(1)}`;
  
  return 'Professional Website';
}

function generateProfessionalWebsite(config: any): string {
  // ... keep existing code (this function will be very long, so implementing smart fallback generation)
  
  const { type, sections, theme, industry, name } = config;
  
  if (type === 'portfolio') {
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

function generatePortfolioWebsite(config: any): string {
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

  const portfolioItems = [
    {
      id: 1,
      title: "Creative Project Alpha",
      category: "Web Design",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      description: "Modern web application with stunning visual design"
    },
    {
      id: 2,
      title: "Brand Identity System",
      category: "Branding",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop",
      description: "Complete brand identity and visual system design"
    },
    {
      id: 3,
      title: "Mobile App Interface",
      category: "UI/UX",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop",
      description: "Intuitive mobile application user interface"
    }
  ];

  const skills = [
    { name: "Web Design", level: 95 },
    { name: "UI/UX Design", level: 90 },
    { name: "Frontend Development", level: 85 },
    { name: "Graphic Design", level: 80 },
    { name: "Photography", level: 75 }
  ];

  return (
    <div className="portfolio-container">
      <nav className={\`navbar \${isScrolled ? 'scrolled' : ''}\`}>
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => setActiveSection('home')}>Home</a></li>
            <li><a href="#about" onClick={() => setActiveSection('about')}>About</a></li>
            <li><a href="#portfolio" onClick={() => setActiveSection('portfolio')}>Portfolio</a></li>
            <li><a href="#skills" onClick={() => setActiveSection('skills')}>Skills</a></li>
            <li><a href="#contact" onClick={() => setActiveSection('contact')}>Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-content">
          <h1 className="hero-title">Creative Designer & Developer</h1>
          <p className="hero-subtitle">Crafting beautiful digital experiences with passion and precision</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setActiveSection('portfolio')}>
              View My Work
            </button>
            <button className="btn-secondary" onClick={() => setActiveSection('contact')}>
              Get In Touch
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <div className="card-content">
              <h3>✨ Professional Portfolio</h3>
              <p>Showcasing creative excellence</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p className="about-intro">
                I'm a passionate creative professional with expertise in design and development. 
                My work focuses on creating beautiful, functional digital experiences that make a difference.
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
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" alt="Profile" />
            </div>
          </div>
        </div>
      </section>

      <section className="portfolio-section" id="portfolio">
        <div className="container">
          <h2 className="section-title">My Portfolio</h2>
          <div className="portfolio-grid">
            {portfolioItems.map(item => (
              <div key={item.id} className="portfolio-item">
                <div className="portfolio-image">
                  <img src={item.image} alt={item.title} />
                  <div className="portfolio-overlay">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="category">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="skills-section" id="skills">
        <div className="container">
          <h2 className="section-title">Skills & Expertise</h2>
          <div className="skills-grid">
            {skills.map(skill => (
              <div key={skill.name} className="skill-item">
                <div className="skill-info">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-percentage">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <div 
                    className="skill-progress" 
                    style={{ width: \`\${skill.level}%\` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="container">
          <h2 className="section-title">Let's Work Together</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Get In Touch</h3>
              <p>Ready to start your next project? Let's discuss how we can bring your vision to life.</p>
              <div className="contact-methods">
                <div className="contact-method">
                  <span>📧</span>
                  <div>
                    <h4>Email</h4>
                    <p>hello@portfolio.com</p>
                  </div>
                </div>
                <div className="contact-method">
                  <span>📱</span>
                  <div>
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="contact-method">
                  <span>📍</span>
                  <div>
                    <h4>Location</h4>
                    <p>San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <input type="text" placeholder="Your Name" required />
              <input type="email" placeholder="Your Email" required />
              <input type="text" placeholder="Subject" required />
              <textarea placeholder="Your Message" rows="5" required></textarea>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 ${config.name}. All rights reserved.</p>
          <div className="social-links">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="GitHub">💻</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
}

function generateReactIndex(): string {
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

function generateProfessionalHTML(config: any): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${config.description || 'Professional website created with AI'}" />
    <title>${config.name} - Professional Website</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
}

function generateProfessionalCSS(config: any): string {
  const isDark = config.theme === 'dark';
  const primaryColor = config.industry === 'healthcare' ? '#0ea5e9' : 
                      config.industry === 'food' ? '#f59e0b' :
                      config.industry === 'creative' ? '#8b5cf6' : '#3b82f6';
  
  return `/* Professional Website Styles */
:root {
  --primary-color: ${primaryColor};
  --primary-hover: ${primaryColor}dd;
  --background: ${isDark ? '#0a0a0a' : '#ffffff'};
  --surface: ${isDark ? '#1a1a1a' : '#f8fafc'};
  --text-primary: ${isDark ? '#ffffff' : '#1a1a1a'};
  --text-secondary: ${isDark ? '#a1a1aa' : '#64748b'};
  --border: ${isDark ? '#2a2a2a' : '#e2e8f0'};
  --shadow: ${isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--background);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.portfolio-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  padding: 1rem 0;
  transition: all 0.3s ease;
  background: ${isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.navbar.scrolled {
  padding: 0.5rem 0;
  box-shadow: var(--shadow);
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
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color), ${primaryColor}80);
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
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
}

.nav-menu a:hover {
  color: var(--primary-color);
}

.nav-menu a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.nav-menu a:hover::after {
  width: 100%;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 2rem;
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
  background: radial-gradient(circle at 30% 70%, ${primaryColor}20 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, ${primaryColor}15 0%, transparent 50%);
  z-index: -1;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), ${primaryColor}dd);
  color: white;
  box-shadow: 0 10px 20px ${primaryColor}30;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px ${primaryColor}40;
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  background: var(--surface);
  transform: translateY(-2px);
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.floating-card {
  background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)'};
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow);
  animation: float 6s ease-in-out infinite;
  max-width: 300px;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.card-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.card-content p {
  color: var(--text-secondary);
}

/* Sections */
section {
  padding: 6rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: var(--text-primary);
}

/* About Section */
.about-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-intro {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.stat-item h3 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-item p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.about-image img {
  width: 100%;
  max-width: 300px;
  border-radius: 20px;
  box-shadow: var(--shadow);
}

/* Portfolio Section */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.portfolio-item {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  background: var(--surface);
  border: 1px solid var(--border);
}

.portfolio-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 50px ${primaryColor}20;
}

.portfolio-image {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/10;
}

.portfolio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.portfolio-item:hover .portfolio-image img {
  transform: scale(1.05);
}

.portfolio-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, ${primaryColor}90, ${primaryColor}70);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
  padding: 2rem;
}

.portfolio-item:hover .portfolio-overlay {
  opacity: 1;
}

.portfolio-overlay h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.portfolio-overlay p {
  margin-bottom: 1rem;
  opacity: 0.9;
}

.category {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Skills Section */
.skills-grid {
  display: grid;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.skill-item {
  background: var(--surface);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skill-name {
  font-weight: 600;
  color: var(--text-primary);
}

.skill-percentage {
  font-weight: 600;
  color: var(--primary-color);
}

.skill-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), ${primaryColor}80);
  border-radius: 4px;
  transition: width 2s ease;
}

/* Contact Section */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.contact-info h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.contact-info p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.contact-method span {
  font-size: 1.5rem;
}

.contact-method h4 {
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.contact-method p {
  color: var(--text-secondary);
  margin: 0;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-form input,
.contact-form textarea {
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text-primary);
  font-family: inherit;
  transition: all 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px ${primaryColor}20;
}

.contact-form textarea {
  resize: vertical;
  min-height: 120px;
}

/* Footer */
.footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 2rem 0;
  text-align: center;
}

.footer .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer p {
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--border);
  border-radius: 50%;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-links a:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .footer .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .portfolio-grid {
    grid-template-columns: 1fr;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Loading animations */
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

.portfolio-item,
.skill-item,
.stat-item,
.contact-method {
  animation: fadeInUp 0.6s ease forwards;
}`;
}

function generatePackageJson(name: string): string {
  return `{
  "name": "${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}",
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

// Main enhanced website generation function
export async function generateWebApplication(userMessage: string, files?: FileList): Promise<GeneratedCode> {
  console.log('🎯 Starting professional website generation for:', userMessage);
  
  try {
    // Step 1: Generate professional website with GROQ
    const groqResponse = await callGroqAPI(userMessage);
    console.log('📊 GROQ professional generation completed');
    
    // Step 2: Enhance with Local LLM if available
    const enhancedResponse = await callLocalLLM(groqResponse, userMessage);
    console.log('🔧 Local LLM professional enhancement completed');
    
    // Step 3: Parse the professional response
    const generatedCode = parseCodeResponse(enhancedResponse);
    console.log('✅ Professional website generation successful!');
    
    return generatedCode;
  } catch (error) {
    console.error('❌ Professional generation failed, using intelligent fallback:', error);
    
    // Create intelligent fallback based on detailed analysis
    const fallbackCode = createIntelligentFallback(userMessage);
    console.log('🔄 Intelligent professional fallback generated successfully');
    console.log('Generated professional files:', Object.keys(fallbackCode));
    
    return fallbackCode;
  }
}
