
// API Configuration - Using a fresh working Groq API key
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Enhanced system prompt for complete functional websites
const GROQ_SYSTEM_PROMPT = `You are a senior React frontend developer building complete, production-ready web applications.

IMPORTANT: You must return ONLY valid JSON in this exact format:
{
  "/src/App.js": { "code": "// Complete React application with routing" },
  "/src/index.js": { "code": "// React DOM render code" },
  "/src/App.css": { "code": "/* Complete CSS styling */" },
  "/public/index.html": { "code": "<!-- HTML template -->" },
  "/package.json": { "code": "// Package.json with all dependencies" }
}

Your task is to build a COMPLETE, FUNCTIONAL WEBSITE (not just a landing page) with multiple pages and full functionality.

CRITICAL REQUIREMENTS:
- Create a multi-page React application with React Router
- Include these functional pages: Home, About, Services/Products, Contact, and 1-2 additional relevant pages
- Add interactive features: contact forms, image galleries, pricing tables, testimonials carousel
- Use React hooks (useState, useEffect) for dynamic functionality
- Include a functional navigation system with active page highlighting
- Add animations, transitions, and interactive elements
- Use modern React patterns and best practices
- Make it fully responsive with mobile-first design
- Include realistic content specific to the business type
- Add loading states, form validation, and user feedback
- Create reusable components and clean code structure

DESIGN REQUIREMENTS:
- Use Tailwind CSS for all styling (no inline CSS)
- Create unique, modern designs with professional color schemes
- Include icons, gradients, shadows, and modern UI elements
- Add smooth animations and hover effects
- Ensure accessibility and semantic HTML
- Create visually distinct designs for each request

FUNCTIONALITY TO INCLUDE:
- Working contact forms with validation
- Image carousels/galleries
- Pricing comparison tables
- Testimonials sections
- FAQ accordions
- Service/product listings
- Interactive buttons and CTAs
- Mobile-responsive navigation menu
- Scroll animations and effects

Always create COMPLETE, FUNCTIONAL WEBSITES ready for production deployment.`;

// Call Groq API with simplified request format
async function callGroqAPI(userMessage: string): Promise<string> {
  try {
    console.log('🚀 Calling GROQ API for website generation:', userMessage);
    
    // Ensure the API key is present
    if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
      throw new Error('Groq API key is not configured');
    }
    
    // Generate random design parameters for variety
    const designStyles = ['bold', 'minimalist', 'dark mode', 'vibrant', 'glassmorphism', 'corporate', 'creative'];
    const layoutStyles = ['split hero', 'grid cards', 'one-page scroll', 'sidebar nav', 'full-width sections'];
    
    const randomStyle = designStyles[Math.floor(Math.random() * designStyles.length)];
    const randomLayout = layoutStyles[Math.floor(Math.random() * layoutStyles.length)];
    
    const enhancedPrompt = `A user wants a complete website for: "${userMessage}"

Build a COMPLETE, FUNCTIONAL MULTI-PAGE WEBSITE (not just a landing page) with full business functionality.

CRITICAL REQUIREMENTS:
- Create a complete React application with React Router for multiple pages
- Design using ${randomLayout} structure with ${randomStyle} visual style
- Include these FUNCTIONAL pages:
  * Home page with hero, features, testimonials
  * About page with company story, team, mission
  * Services/Products page with detailed offerings
  * Contact page with working forms and maps
  * Gallery/Portfolio page (if relevant)
  * Additional relevant pages for the business type

FUNCTIONAL FEATURES TO IMPLEMENT:
- Working contact forms with validation and success messages
- Interactive image galleries/carousels
- Pricing tables with comparison features
- Testimonials carousel with auto-rotation
- FAQ accordion sections
- Service cards with hover effects and details
- Mobile-responsive navigation with hamburger menu
- Search functionality (if applicable)
- Newsletter signup forms
- Social media integration
- Scroll-to-top functionality
- Loading animations and transitions

TECHNICAL REQUIREMENTS:
- Use React functional components with hooks (useState, useEffect)
- Implement React Router for page navigation
- Use Tailwind CSS for responsive, modern styling
- Add form validation and user feedback
- Include interactive animations and transitions
- Create reusable components
- Add proper error handling
- Ensure accessibility standards

Make this a complete, production-ready website that a business could actually use. Return only the JSON object with complete React application code.`;

    const requestBody = {
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: GROQ_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 8192,
      top_p: 0.8,
      stream: false
    };
    
    console.log('📤 Making Groq API request...');
    
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Groq response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GROQ API Error:', response.status, errorText);
      throw new Error(`GROQ API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ GROQ API response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid Groq response structure');
      throw new Error('Invalid response structure from Groq API');
    }
    
    const content = data.choices[0].message.content;
    console.log('📋 Groq content length:', content.length);
    
    return content;
  } catch (error) {
    console.error('❌ GROQ API call failed:', error);
    throw error;
  }
}

// Enhanced JSON parsing with better error handling
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing Groq response...');
    
    let cleanedResponse = response.trim();
    
    // Remove markdown formatting
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^```.*$/gm, '');
    
    // Extract JSON object
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No valid JSON object found in response');
    }
    
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    
    // Fix common JSON issues
    cleanedResponse = cleanedResponse.replace(/'/g, '"');
    cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}');
    
    console.log('🔧 Attempting to parse cleaned JSON...');
    const parsedCode = JSON.parse(cleanedResponse);
    
    // Validate required files
    const requiredFiles = ['/src/App.js', '/src/index.js', '/src/App.css', '/public/index.html', '/package.json'];
    const missingFiles = requiredFiles.filter(file => !parsedCode[file] || !parsedCode[file].code);
    
    if (missingFiles.length > 0) {
      console.log('⚠️ Missing files:', missingFiles);
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    console.log('✅ Successfully parsed Groq response');
    return parsedCode;
  } catch (error) {
    console.error('❌ Error parsing Groq response:', error);
    throw error;
  }
}

// Template varieties for better fallback diversity
const TEMPLATE_STYLES = [
  { name: 'Modern Gradient', colors: ['#667eea', '#764ba2'], style: 'modern' },
  { name: 'Corporate Blue', colors: ['#2196F3', '#21CBF3'], style: 'corporate' },
  { name: 'Creative Purple', colors: ['#8B5CF6', '#A78BFA'], style: 'creative' },
  { name: 'Nature Green', colors: ['#10B981', '#34D399'], style: 'nature' },
  { name: 'Sunset Orange', colors: ['#F59E0B', '#FBB042'], style: 'warm' },
  { name: 'Ocean Teal', colors: ['#0891B2', '#06B6D4'], style: 'cool' },
  { name: 'Royal Purple', colors: ['#7C3AED', '#A855F7'], style: 'luxury' },
  { name: 'Fire Red', colors: ['#EF4444', '#F87171'], style: 'bold' },
  { name: 'Forest Dark', colors: ['#059669', '#047857'], style: 'dark' },
  { name: 'Sky Light', colors: ['#3B82F6', '#60A5FA'], style: 'light' }
];

const BUSINESS_TEMPLATES = {
  gym: ['Modern Gradient', 'Fire Red', 'Forest Dark'],
  healthcare: ['Corporate Blue', 'Ocean Teal', 'Sky Light'],
  restaurant: ['Sunset Orange', 'Nature Green', 'Warm'],
  business: ['Corporate Blue', 'Royal Purple', 'Modern Gradient'],
  creative: ['Creative Purple', 'Fire Red', 'Bold'],
  default: ['Modern Gradient', 'Corporate Blue', 'Creative Purple']
};

// Intelligent fallback with true randomization
function createIntelligentFallback(userMessage: string): GeneratedCode {
  console.log('🎨 Creating randomized fallback website for:', userMessage);
  
  // Analyze business type
  const businessType = detectBusinessType(userMessage);
  
  // Get appropriate templates for this business type
  const suitableTemplates = BUSINESS_TEMPLATES[businessType] || BUSINESS_TEMPLATES.default;
  
  // Add randomization to ensure different results
  const randomTemplateIndex = Math.floor(Math.random() * suitableTemplates.length);
  const selectedTemplateName = suitableTemplates[randomTemplateIndex];
  const selectedTemplate = TEMPLATE_STYLES.find(t => t.name === selectedTemplateName) || TEMPLATE_STYLES[0];
  
  // Add timestamp for uniqueness
  const uniqueId = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  
  const websiteConfig = {
    type: businessType,
    template: selectedTemplate,
    name: generateBusinessName(userMessage, businessType),
    description: userMessage,
    uniqueId: `${uniqueId}-${randomSuffix}`,
    timestamp: new Date().toISOString()
  };
  
  console.log('🎯 Generated unique config:', {
    type: websiteConfig.type,
    template: websiteConfig.template.name,
    name: websiteConfig.name,
    uniqueId: websiteConfig.uniqueId
  });
  
  return {
    '/src/App.js': { code: generateUniqueWebsite(websiteConfig) },
    '/src/index.js': { code: generateReactIndex() },
    '/src/App.css': { code: generateUniqueCSS(websiteConfig) },
    '/public/index.html': { code: generateUniqueHTML(websiteConfig) },
    '/package.json': { code: generatePackageJson(websiteConfig.name) }
  };
}

function detectBusinessType(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('gym') || lowerMessage.includes('fitness') || lowerMessage.includes('workout')) return 'gym';
  if (lowerMessage.includes('healthcare') || lowerMessage.includes('clinic') || lowerMessage.includes('medical')) return 'healthcare';
  if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('cafe')) return 'restaurant';
  if (lowerMessage.includes('creative') || lowerMessage.includes('design') || lowerMessage.includes('art')) return 'creative';
  
  return 'business';
}

function generateBusinessName(userMessage: string, businessType: string): string {
  const uniqueId = Math.floor(Math.random() * 1000);
  
  const nameVariations = {
    gym: [`PowerFit Gym ${uniqueId}`, `Elite Fitness ${uniqueId}`, `BodyForge ${uniqueId}`, `FlexZone ${uniqueId}`],
    healthcare: [`HealthFirst Clinic ${uniqueId}`, `WellCare Medical ${uniqueId}`, `Vital Health ${uniqueId}`, `MedPlus ${uniqueId}`],
    restaurant: [`Savory Kitchen ${uniqueId}`, `Gourmet Bistro ${uniqueId}`, `Fresh Table ${uniqueId}`, `Culinary Arts ${uniqueId}`],
    creative: [`Creative Studio ${uniqueId}`, `Design Hub ${uniqueId}`, `Artisan Works ${uniqueId}`, `Vision Creative ${uniqueId}`],
    business: [`Business Pro ${uniqueId}`, `Corporate Solutions ${uniqueId}`, `Enterprise Hub ${uniqueId}`, `Success Partners ${uniqueId}`]
  };
  
  const variations = nameVariations[businessType] || nameVariations.business;
  return variations[Math.floor(Math.random() * variations.length)];
}

function generateUniqueWebsite(config: any): string {
  const { type, template, name, uniqueId } = config;
  const [primaryColor, secondaryColor] = template.colors;
  
  // Generate different layouts based on template style
  const layoutVariations = {
    modern: generateModernLayout(config),
    corporate: generateCorporateLayout(config),
    creative: generateCreativeLayout(config),
    luxury: generateLuxuryLayout(config)
  };
  
  return layoutVariations[template.style] || layoutVariations.modern;
}

function generateModernLayout(config: any): string {
  const { name, template, uniqueId } = config;
  const [primaryColor, secondaryColor] = template.colors;
  
  return `// Template: ${template.name} | Generated: ${new Date().toISOString()} | ID: ${uniqueId}
import React, { useState, useEffect } from 'react';

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container" data-template="${template.name}" data-id="${uniqueId}">
      <nav className={\`navbar \${scrolled ? 'scrolled' : ''}\`}>
        <div className="nav-container">
          <h2 className="logo">${name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#contact" className="nav-link">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to ${name}</h1>
            <p className="hero-subtitle">Experience excellence with our premium services</p>
            <div className="hero-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💼</div>
              <h3>Professional Service</h3>
              <p>High-quality solutions tailored to your needs</p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>Quick turnaround times without compromising quality</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>Targeted Results</h3>
              <p>Focused approach to achieve your specific goals</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateCorporateLayout(config: any): string {
  const { name, template, uniqueId } = config;
  
  return `// Corporate Template: ${template.name} | ID: ${uniqueId}
import React from 'react';

function App() {
  return (
    <div className="corporate-app" data-template="${template.name}">
      <header className="corporate-header">
        <div className="header-container">
          <div className="logo-section">
            <h1>${name}</h1>
          </div>
          <nav className="main-navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#solutions">Solutions</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-banner">
          <div className="banner-content">
            <h2>Professional Excellence</h2>
            <p>Leading solutions for modern businesses</p>
            <button className="cta-button">Discover More</button>
          </div>
        </section>

        <section className="solutions-section">
          <div className="solutions-container">
            <h3>Our Solutions</h3>
            <div className="solutions-grid">
              <div className="solution-item">
                <h4>Strategy</h4>
                <p>Strategic planning and consultation</p>
              </div>
              <div className="solution-item">
                <h4>Implementation</h4>
                <p>Efficient execution of your vision</p>
              </div>
              <div className="solution-item">
                <h4>Support</h4>
                <p>Ongoing support and maintenance</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;`;
}

function generateCreativeLayout(config: any): string {
  const { name, template, uniqueId } = config;
  
  return `// Creative Template: ${template.name} | ID: ${uniqueId}
import React from 'react';

function App() {
  return (
    <div className="creative-app" data-template="${template.name}">
      <div className="creative-container">
        <header className="creative-header">
          <div className="brand-section">
            <h1 className="brand-name">${name}</h1>
            <p className="brand-tagline">Creative Excellence</p>
          </div>
        </header>

        <section className="creative-showcase">
          <div className="showcase-content">
            <h2 className="showcase-title">Unleash Creativity</h2>
            <div className="creative-grid">
              <div className="creative-card">
                <div className="card-icon">🎨</div>
                <h3>Design</h3>
                <p>Innovative visual solutions</p>
              </div>
              <div className="creative-card">
                <div className="card-icon">💡</div>
                <h3>Innovation</h3>
                <p>Fresh ideas and concepts</p>
              </div>
              <div className="creative-card">
                <div className="card-icon">🚀</div>
                <h3>Launch</h3>
                <p>Bringing visions to life</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;`;
}

function generateLuxuryLayout(config: any): string {
  const { name, template, uniqueId } = config;
  
  return `// Luxury Template: ${template.name} | ID: ${uniqueId}
import React from 'react';

function App() {
  return (
    <div className="luxury-app" data-template="${template.name}">
      <nav className="luxury-navigation">
        <div className="nav-content">
          <div className="luxury-logo">${name}</div>
          <ul className="luxury-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      <section className="luxury-hero">
        <div className="hero-overlay">
          <div className="luxury-content">
            <h1 className="luxury-title">Premium Excellence</h1>
            <p className="luxury-subtitle">Exceptional quality and sophisticated solutions</p>
            <button className="luxury-button">Explore Collection</button>
          </div>
        </div>
      </section>

      <section className="luxury-features">
        <div className="features-container">
          <div className="feature-item">
            <h3>Exclusivity</h3>
            <p>Unique and bespoke solutions</p>
          </div>
          <div className="feature-item">
            <h3>Quality</h3>
            <p>Uncompromising standards</p>
          </div>
          <div className="feature-item">
            <h3>Service</h3>
            <p>White-glove treatment</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateUniqueCSS(config: any): string {
  const { template, uniqueId } = config;
  const [primaryColor, secondaryColor] = template.colors;
  
  return `/* ${template.name} CSS Template | ID: ${uniqueId} | Generated: ${new Date().toISOString()} */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.app-container, .corporate-app, .creative-app, .luxury-app {
  min-height: 100vh;
  background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
}

/* Navigation Styles */
.navbar, .corporate-header, .creative-header, .luxury-navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav-container, .header-container, .nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo, .brand-name, .luxury-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: ${primaryColor};
}

.nav-menu, .main-navigation ul, .luxury-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-link, .main-navigation a, .luxury-menu a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover, .main-navigation a:hover, .luxury-menu a:hover {
  color: ${primaryColor};
}

/* Hero Sections */
.hero-section, .hero-banner, .creative-showcase, .luxury-hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
}

.hero-title, .showcase-title, .luxury-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  animation: fadeInUp 1s ease;
}

.hero-subtitle, .luxury-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease 0.2s both;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: fadeInUp 1s ease 0.4s both;
}

.btn-primary, .cta-button, .luxury-button {
  background: white;
  color: ${primaryColor};
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover, .cta-button:hover, .luxury-button:hover {
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
  color: ${primaryColor};
}

/* Service Sections */
.services-section, .solutions-section, .luxury-features {
  padding: 5rem 0;
  background: white;
}

.container, .solutions-container, .features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #333;
}

.services-grid, .solutions-grid, .creative-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.service-card, .solution-item, .creative-card, .feature-item {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
}

.service-card:hover, .creative-card:hover, .feature-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.service-icon, .card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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

/* Template-specific styles */
.corporate-app {
  background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
}

.creative-app {
  background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
  position: relative;
  overflow-x: hidden;
}

.luxury-app {
  background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title, .luxury-title {
    font-size: 2.5rem;
  }
  
  .nav-menu, .luxury-menu {
    gap: 1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}

/* Unique identifier for debugging */
[data-template="${template.name}"][data-id="${uniqueId}"] {
  --primary-color: ${primaryColor};
  --secondary-color: ${secondaryColor};
}`;
}

function generateUniqueHTML(config: any): string {
  const { name, template, uniqueId } = config;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | ${template.name} Template</title>
    <meta name="description" content="Website generated with ${template.name} template - ID: ${uniqueId}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <!-- Template: ${template.name} | Generated: ${new Date().toISOString()} | ID: ${uniqueId} -->
</body>
</html>`;
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

function generatePackageJson(siteName: string): string {
  return `{
  "name": "${siteName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}",
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

// Main website generation function - Fixed to properly handle Groq API
export async function generateWebsite(userMessage: string): Promise<GeneratedCode> {
  console.log('🌟 Starting website generation for:', userMessage);
  
  try {
    console.log('🚀 Attempting Groq API call...');
    const groqResponse = await callGroqAPI(userMessage);
    console.log('✅ Groq API call successful');
    
    const parsedCode = parseCodeResponse(groqResponse);
    console.log('✅ Successfully generated website via Groq API');
    return parsedCode;
    
  } catch (groqError) {
    console.error('❌ Groq API failed, using intelligent fallback:', groqError);
    return createIntelligentFallback(userMessage);
  }
}
