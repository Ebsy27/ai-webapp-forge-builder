// API Configuration - updated with new key
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';
const LOCAL_LLM_ENDPOINT = 'http://127.0.0.1:1234/v1/chat/completions';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Enhanced system prompt for modern website generation with better user understanding
const GROQ_SYSTEM_PROMPT = `You are an expert AI website builder that creates stunning, modern websites based on user ideas. You must carefully analyze user requirements and generate professional, production-ready websites.

CRITICAL: You MUST return ONLY a valid JSON object with exactly this structure:
{
  "/src/App.js": { "code": "// React component code here" },
  "/src/index.js": { "code": "// React entry point here" },
  "/src/App.css": { "code": "/* CSS styles here */" },
  "/public/index.html": { "code": "<!-- HTML template here -->" },
  "/package.json": { "code": "// package.json content here" }
}

REQUIREMENT ANALYSIS:
- Carefully read and understand the user's website idea, purpose, and vision
- Identify the website type (business, portfolio, e-commerce, restaurant, healthcare, etc.)
- Extract specific features, sections, and functionality requirements
- Note any style preferences (modern, minimal, dark theme, colors, etc.)
- Consider the target audience and industry context

MODERN DESIGN STANDARDS:
- Apply contemporary web design trends and best practices
- Use modern CSS techniques: CSS Grid, Flexbox, smooth animations
- Implement glassmorphism, gradient backgrounds, and subtle shadows
- Apply modern typography with Google Fonts (Inter, Poppins, Montserrat)
- Use sophisticated color palettes and professional spacing
- Add micro-interactions and hover effects for enhanced UX

RESPONSIVE & PROFESSIONAL:
- Ensure pixel-perfect responsive design for all screen sizes
- Implement mobile-first approach with smooth breakpoints
- Use semantic HTML5 structure for accessibility
- Add smooth scrolling, lazy loading, and performance optimizations
- Include proper meta tags and SEO considerations

CONTENT ADAPTATION:
- Tailor all content, sections, and features to user's specific idea
- Create unique, industry-appropriate copy and structure
- Include relevant sections based on website purpose
- Make navigation intuitive and user-friendly
- Ensure all elements serve the user's business goals

TECHNICAL EXCELLENCE:
- Write clean, maintainable React code with modern hooks
- Use advanced CSS with custom properties and animations
- Implement proper component structure and reusability
- Add loading states, error handling, and user feedback
- Ensure cross-browser compatibility and performance

Return ONLY the JSON object - no markdown, no explanations, no additional text.`;

// Call GROQ API with enhanced website generation
async function callGroqAPI(userMessage: string): Promise<string> {
  try {
    console.log('🚀 Calling GROQ API for modern website generation:', userMessage);
    
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${GROQ_API_KEY}\`,
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
            content: \`Create a modern, professional website based on this user idea: "\${userMessage}"

ANALYSIS REQUIREMENTS:
1. Understand the core purpose and vision behind this website idea
2. Identify the target audience and industry context
3. Determine appropriate sections, features, and functionality
4. Apply modern design principles and contemporary styling
5. Ensure responsive design and professional appearance

MODERN TEMPLATE FEATURES TO INCLUDE:
- Hero section with compelling copy and modern visuals
- Clean navigation with smooth scrolling
- Professional typography and spacing
- Modern color schemes and gradients
- Smooth animations and micro-interactions
- Responsive grid layouts
- Call-to-action buttons with hover effects
- Footer with social links and contact info

Generate a stunning, production-ready website that brings their idea to life! \`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ API Error:', response.status, errorText);
      throw new Error(\`GROQ API error: \${response.status}\`);
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
            content: \`Enhance this professional website for "\${userMessage}" with advanced styling and features: \${baseCode}\`
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
      console.log('⚠️ Missing files, creating modern fallback');
      throw new Error(\`Missing required files: \${missingFiles.join(', ')}\`);
    }
    
    console.log('✅ Successfully parsed modern website');
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
    '/src/App.js': { code: generateModernWebsite(websiteConfig) },
    '/src/index.js': { code: generateReactIndex() },
    '/src/App.css': { code: generateModernCSS(websiteConfig) },
    '/public/index.html': { code: generateModernHTML(websiteConfig) },
    '/package.json': { code: generatePackageJson(websiteConfig.name) }
  };
}

function analyzeRequirements(userMessage: string) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Website type detection
  let type = 'business';
  let sections = ['hero', 'about', 'contact'];
  let theme = 'modern';
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
  if (typeMatches) return \`Modern \${typeMatches[1].charAt(0).toUpperCase() + typeMatches[1].slice(1)}\`;
  
  return 'Modern Website';
}

function generateModernWebsite(config: any): string {
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

function generateBusinessWebsite(config: any): string {
  return \`import React, { useState, useEffect } from 'react';

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
          <h2 className="logo">\${config.name}</h2>
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
            <h1 className="hero-title">Transform Your Business with \${config.name}</h1>
            <p className="hero-subtitle">Experience excellence in modern business solutions designed for today's digital world</p>
            <div className="hero-buttons">
              <button className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-icon">🚀</div>
              <h3>Modern Solutions</h3>
              <p>Cutting-edge technology meets exceptional service</p>
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
          <div className="about-content">
            <div className="about-text">
              <p>We are a forward-thinking company dedicated to providing innovative solutions that drive business growth and success in the digital age.</p>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Happy Clients</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">10+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </div>
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
              <p>Strategic guidance to accelerate your business growth and optimize operations</p>
              <div className="service-features">
                <span>Strategic Planning</span>
                <span>Process Optimization</span>
                <span>Growth Strategy</span>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Digital Solutions</h3>
              <p>Custom technology solutions tailored to your specific business needs</p>
              <div className="service-features">
                <span>Web Development</span>
                <span>Mobile Apps</span>
                <span>Cloud Integration</span>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>Marketing Services</h3>
              <p>Data-driven marketing strategies to expand your reach and engagement</p>
              <div className="service-features">
                <span>Digital Marketing</span>
                <span>SEO Optimization</span>
                <span>Brand Strategy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2 className="section-title">Get In Touch</h2>
              <p>Take the first step towards better health. Our team is here to provide you with the care you deserve.</p>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div className="method-details">
                    <h4>Email Us</h4>
                    <p>hello@${config.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
                <div className="contact-method">
                  <div className="method-icon">📞</div>
                  <div className="method-details">
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <div className="form-row">
                <input type="text" placeholder="Your Name" className="form-input" required />
                <input type="email" placeholder="Your Email" className="form-input" required />
              </div>
              <div className="form-row">
                <input type="text" placeholder="Subject" className="form-input" required />
                <textarea placeholder="Your Message" className="form-textarea" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 ${config.name}. Crafted with ❤️ and ☕</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
}

function generateRestaurantWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const menuItems = [
    { 
      name: "Signature Gourmet Pasta", 
      price: "$28", 
      description: "Handcrafted pasta with our chef's special truffle cream sauce",
      category: "Main Course"
    },
    { 
      name: "Pan-Seared Atlantic Salmon", 
      price: "$32", 
      description: "Fresh Atlantic salmon with seasonal vegetables and lemon herb butter",
      category: "Seafood"
    },
    { 
      name: "Artisanal Caesar Salad", 
      price: "$18", 
      description: "Crisp romaine lettuce with house-made croutons and aged parmesan",
      category: "Appetizer"
    }
  ];

  return (
    <div className="restaurant-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#menu" className="nav-link">Menu</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#reservations" className="nav-link">Reservations</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to ${config.name}</h1>
          <p className="hero-subtitle">An unforgettable culinary journey awaits you with our exquisite dishes and warm hospitality</p>
          <div className="hero-buttons">
            <button className="btn-primary">View Menu</button>
            <button className="btn-secondary">Make Reservation</button>
          </div>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Signature Menu</h2>
            <p className="section-subtitle">Crafted with passion, served with love</p>
          </div>
          <div className="menu-grid">
            {menuItems.map((item, index) => (
              <div key={index} className="menu-card">
                <div className="menu-card-header">
                  <span className="menu-category">{item.category}</span>
                  <span className="menu-price">{item.price}</span>
                </div>
                <h3 className="menu-item-name">{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
                <button className="btn-menu">Order Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title">Our Story</h2>
            <p>For over two decades, we have been dedicated to creating extraordinary dining experiences that celebrate the finest ingredients and time-honored culinary traditions.</p>
            <div className="restaurant-features">
              <div className="feature-item">
                <div className="feature-icon">👨‍🍳</div>
                <h4>Master Chefs</h4>
                <p>Award-winning culinary team</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🌱</div>
                <h4>Fresh Ingredients</h4>
                <p>Locally sourced, seasonal produce</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🍷</div>
                <h4>Fine Wines</h4>
                <p>Curated wine selection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reservations-section" id="reservations">
        <div className="container">
          <div className="reservations-content">
            <h2 className="section-title">Make a Reservation</h2>
            <p>Book your table for an exceptional dining experience</p>
            <form className="reservation-form">
              <div className="form-row">
                <input type="text" placeholder="Your Name" className="form-input" required />
                <input type="email" placeholder="Your Email" className="form-input" required />
              </div>
              <div className="form-row">
                <input type="date" className="form-input" required />
                <select className="form-input" required>
                  <option value="">Select Time</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
              <div className="form-row">
                <select className="form-input" required>
                  <option value="">Number of Guests</option>
                  <option value="2">2 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">6 Guests</option>
                  <option value="8">8+ Guests</option>
                </select>
              </div>
              <button type="submit" className="btn-primary full-width">Reserve Table</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;`;
}

function generateHealthcareWebsite(config: any): string {
  return `import React, { useState } from 'react';

function App() {
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    service: '',
    message: ''
  });

  const services = [
    { 
      name: "General Consultation", 
      description: "Comprehensive health assessment and primary care services",
      icon: "🩺",
      duration: "30-45 min"
    },
    { 
      name: "Specialist Care", 
      description: "Expert medical specialists for specialized health conditions",
      icon: "👨‍⚕️",
      duration: "45-60 min"
    },
    { 
      name: "Preventive Care", 
      description: "Regular check-ups and preventive health screenings",
      icon: "💚",
      duration: "20-30 min"
    },
    { 
      name: "Emergency Services", 
      description: "24/7 emergency medical care and urgent treatment",
      icon: "🚨",
      duration: "Immediate"
    }
  ];

  const handleInputChange = (e) => {
    setAppointmentForm({
      ...appointmentForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="healthcare-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#services" className="nav-link">Services</a></li>
            <li><a href="#doctors" className="nav-link">Our Team</a></li>
            <li><a href="#appointments" className="nav-link">Appointments</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your Health, Our Priority</h1>
            <p className="hero-subtitle">Experience compassionate, comprehensive healthcare with our team of dedicated medical professionals</p>
            <div className="hero-buttons">
              <button className="btn-primary">Book Appointment</button>
              <button className="btn-secondary">Emergency Care</button>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">25+</div>
              <div className="stat-label">Years of Excellence</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Patients Served</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Emergency Care</div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Medical Services</h2>
            <p className="section-subtitle">Comprehensive healthcare solutions for you and your family</p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card healthcare-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span className="duration">Duration: {service.duration}</span>
                </div>
                <button className="btn-secondary">Learn More</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="doctors-section" id="doctors">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Meet Our Medical Team</h2>
            <p className="section-subtitle">Experienced professionals dedicated to your wellbeing</p>
          </div>
          <div className="doctors-grid">
            <div className="doctor-card">
              <div className="doctor-image">👨‍⚕️</div>
              <h3>Dr. Michael Johnson</h3>
              <p className="doctor-specialty">Chief of Medicine</p>
              <p className="doctor-bio">25+ years experience in internal medicine and patient care</p>
              <div className="doctor-qualifications">
                <span>MD, Internal Medicine</span>
                <span>Board Certified</span>
              </div>
            </div>
            <div className="doctor-card">
              <div className="doctor-image">👩‍⚕️</div>
              <h3>Dr. Sarah Williams</h3>
              <p className="doctor-specialty">Cardiologist</p>
              <p className="doctor-bio">Specialist in cardiovascular health and preventive cardiology</p>
              <div className="doctor-qualifications">
                <span>MD, Cardiology</span>
                <span>Fellowship Trained</span>
              </div>
            </div>
            <div className="doctor-card">
              <div className="doctor-image">👨‍⚕️</div>
              <h3>Dr. Robert Chen</h3>
              <p className="doctor-specialty">Emergency Medicine</p>
              <p className="doctor-bio">Expert in emergency care and trauma medicine</p>
              <div className="doctor-qualifications">
                <span>MD, Emergency Medicine</span>
                <span>Trauma Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="appointments-section" id="appointments">
        <div className="container">
          <div className="appointments-content">
            <h2 className="section-title">Schedule Your Appointment</h2>
            <p>Take the first step towards better health. Our team is here to provide you with the care you deserve.</p>
            <form className="appointment-form">
              <div className="form-row">
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  className="form-input"
                  value={appointmentForm.name}
                  onChange={handleInputChange}
                  required 
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  className="form-input"
                  value={appointmentForm.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-row">
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Phone Number" 
                  className="form-input"
                  value={appointmentForm.phone}
                  onChange={handleInputChange}
                  required 
                />
                <input 
                  type="date" 
                  name="date"
                  className="form-input"
                  value={appointmentForm.date}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <select 
                name="service"
                className="form-input"
                value={appointmentForm.service}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Service</option>
                {services.map((service, index) => (
                  <option key={index} value={service.name}>{service.name}</option>
                ))}
              </select>
              <textarea 
                name="message"
                placeholder="Additional message or concerns"
                className="form-textarea"
                rows="4"
                value={appointmentForm.message}
                onChange={handleInputChange}
              ></textarea>
              <button type="submit" className="btn-primary full-width">Book Appointment</button>
            </form>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="emergency-banner">
            <div className="emergency-content">
              <h3>Medical Emergency?</h3>
              <p>For immediate medical attention, call our emergency line or visit our emergency department.</p>
              <button className="btn-emergency">Call Emergency: (555) 911-HELP</button>
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
  return `import React, { useState } from 'react';

function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const products = [
    { 
      id: 1, 
      name: "Premium Wireless Headphones", 
      price: 199.99, 
      originalPrice: 249.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      category: "electronics",
      rating: 4.8,
      reviews: 324
    },
    { 
      id: 2, 
      name: "Designer Leather Bag", 
      price: 159.99, 
      originalPrice: 199.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      category: "fashion",
      rating: 4.9,
      reviews: 156
    },
    { 
      id: 3, 
      name: "Smart Fitness Watch", 
      price: 299.99, 
      originalPrice: 349.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      category: "electronics",
      rating: 4.7,
      reviews: 892
    },
    { 
      id: 4, 
      name: "Organic Skincare Set", 
      price: 89.99, 
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
      category: "beauty",
      rating: 4.6,
      reviews: 203
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'beauty', name: 'Beauty' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="ecommerce-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#products" className="nav-link">Products</a></li>
            <li><a href="#about" className="nav-link">About</a></li>
            <li><a href="#cart" className="nav-link cart-link">
              Cart ({getTotalItems()})
              {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
            </a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Discover Premium Products</h1>
            <p className="hero-subtitle">Shop the latest trends and exclusive collections with unbeatable prices and quality</p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span>Free Shipping</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">↩️</span>
                <span>Easy Returns</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Secure Payment</span>
              </div>
            </div>
            <button className="btn-primary">Shop Now</button>
          </div>
          <div className="hero-visual">
            <div className="product-demo">
              <div className="demo-window">
                <div className="window-header">
                  <div className="window-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                  <div className="window-title">${config.name} Dashboard</div>
                </div>
                <div className="window-content">
                  <div className="demo-chart">
                    <div className="chart-bars">
                      <div className="bar" style={{height: '60%'}}></div>
                      <div className="bar" style={{height: '80%'}}></div>
                      <div className="bar" style={{height: '40%'}}></div>
                      <div className="bar" style={{height: '90%'}}></div>
                      <div className="bar" style={{height: '70%'}}></div>
                    </div>
                    <div className="chart-label">Performance Analytics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Curated selection of our most popular items</p>
          </div>
          
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={\`filter-btn \${selectedCategory === category.id ? 'active' : ''}\`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-overlay">
                    <button 
                      onClick={() => addToCart(product)}
                      className="btn-add-cart"
                    >
                      Add to Cart
                    </button>
                  </div>
                  {product.originalPrice > product.price && (
                    <div className="discount-badge">
                      Save \${(product.originalPrice - product.price).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    <div className="stars">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="rating-text">({product.reviews} reviews)</span>
                  </div>
                  <div className="product-pricing">
                    <span className="current-price">\${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">\${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cart-section" id="cart">
        <div className="container">
          <h2 className="section-title">Shopping Cart</h2>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Discover amazing products and add them to your cart</p>
              <button className="btn-primary">Continue Shopping</button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">\${item.price} x {item.quantity}</p>
                      <p className="cart-item-total">Subtotal: \${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span>\${getTotalPrice()}</span>
                </div>
                <div className="summary-item">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-total">
                  <span>Total:</span>
                  <span>\${getTotalPrice()}</span>
                </div>
                <button className="btn-primary full-width">Proceed to Checkout</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title">Why Choose ${config.name}?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏆</div>
                <h3>Premium Quality</h3>
                <p>Carefully curated products from trusted brands and suppliers</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Fast Delivery</h3>
                <p>Quick and reliable shipping to your doorstep</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Shopping</h3>
                <p>Your personal and payment information is always protected</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>24/7 Support</h3>
                <p>Customer service team ready to help whenever you need</p>
              </div>
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
  return `import React, { useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const features = [
    { 
      title: "Lightning Fast Performance", 
      description: "Experience blazing-fast speed with our optimized infrastructure and cutting-edge technology",
      icon: "⚡",
      stats: "99.9% Uptime"
    },
    { 
      title: "Enterprise Security", 
      description: "Your data is protected with military-grade encryption and advanced security protocols",
      icon: "🔒",
      stats: "256-bit SSL"
    },
    { 
      title: "Intuitive Design", 
      description: "User-friendly interface designed for maximum productivity and seamless user experience",
      icon: "🎨",
      stats: "5-star UX Rating"
    }
  ];

  const testimonials = [
    { 
      name: "Sarah Johnson", 
      role: "CEO, TechCorp",
      text: "This solution completely transformed our business operations. The results exceeded all our expectations!",
      avatar: "👩‍💼",
      rating: 5
    },
    { 
      name: "Michael Chen", 
      role: "Founder, StartupXYZ",
      text: "Incredible platform! We saw a 300% increase in productivity within the first month of implementation.",
      avatar: "👨‍💻",
      rating: 5
    },
    { 
      name: "Emily Rodriguez", 
      role: "Director, InnovateLab",
      text: "Outstanding support and amazing features. This is exactly what we needed to scale our operations.",
      avatar: "👩‍🔬",
      rating: 5
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-container">
          <h2 className="logo">${config.name}</h2>
          <ul className="nav-menu">
            <li><a href="#home" className="nav-link">Home</a></li>
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#testimonials" className="nav-link">Reviews</a></li>
            <li><a href="#pricing" className="nav-link">Pricing</a></li>
            <li><a href="#cta" className="btn-nav">Get Started</a></li>
          </ul>
        </div>
      </nav>

      <section className="hero-section" id="home">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-icon">🚀</span>
              <span>New: Advanced AI Integration Available</span>
            </div>
            <h1 className="hero-title">Transform Your Business with ${config.name}</h1>
            <p className="hero-subtitle">Join over 10,000+ companies that trust our platform to accelerate growth, boost productivity, and achieve remarkable results in record time.</p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="btn-primary">Start Free Trial</button>
              <button className="btn-secondary">Watch Demo</button>
            </div>
            <div className="trust-indicators">
              <p className="trust-text">Trusted by leading companies worldwide</p>
              <div className="company-logos">
                <span>🏢 TechCorp</span>
                <span>🚀 StartupXYZ</span>
                <span>🏛️ Enterprise Inc</span>
                <span>⚡ InnovateLab</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="product-demo">
              <div className="demo-window">
                <div className="window-header">
                  <div className="window-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                  <div className="window-title">${config.name} Dashboard</div>
                </div>
                <div className="window-content">
                  <div className="demo-chart">
                    <div className="chart-bars">
                      <div className="bar" style={{height: '60%'}}></div>
                      <div className="bar" style={{height: '80%'}}></div>
                      <div className="bar" style={{height: '40%'}}></div>
                      <div className="bar" style={{height: '90%'}}></div>
                      <div className="bar" style={{height: '70%'}}></div>
                    </div>
                    <div className="chart-label">Performance Analytics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose ${config.name}?</h2>
            <p className="section-subtitle">Powerful features designed to accelerate your success</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-stats">{feature.stats}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <button className="btn-feature">Learn More</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="social-proof-section">
        <div className="container">
          <div className="social-proof-content">
            <div className="proof-stats">
              <div className="proof-item">
                <div className="proof-number">500%</div>
                <div className="proof-label">Average ROI Increase</div>
              </div>
              <div className="proof-item">
                <div className="proof-number">3 months</div>
                <div className="proof-label">Average Payback Period</div>
              </div>
              <div className="proof-item">
                <div className="proof-number">50+ hours</div>
                <div className="proof-label">Time Saved Monthly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real results from real businesses</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                  <div className="testimonial-rating">
                    {'★'.repeat(testimonial.rating)}
                  </div>
                </div>
                <blockquote>"{testimonial.text}"</blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">Choose the plan that's right for your business</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">29</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✅ Up to 5 users</li>
                <li>✅ 10GB storage</li>
                <li>✅ Basic support</li>
                <li>✅ Core features</li>
              </ul>
              <button className="btn-primary">Start Free Trial</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Professional</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">79</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✅ Up to 25 users</li>
                <li>✅ 100GB storage</li>
                <li>✅ Priority support</li>
                <li>✅ Advanced features</li>
                <li>✅ Custom integrations</li>
              </ul>
              <button className="btn-primary primary">Start Free Trial</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">199</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✅ Unlimited users</li>
                <li>✅ Unlimited storage</li>
                <li>✅ 24/7 dedicated support</li>
                <li>✅ All features</li>
                <li>✅ White-label options</li>
              </ul>
              <button className="btn-primary">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Business?</h2>
            <p className="cta-subtitle">Join thousands of successful companies already using ${config.name}</p>
            {isSubscribed ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Thank you for subscribing!</h3>
                <p>We'll be in touch soon with your free trial details.</p>
              </div>
            ) : (
              <form className="cta-form" onSubmit={handleSubscribe}>
                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Enter your business email"
                    className="cta-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary">Start Free Trial</button>
                </div>
                <p className="cta-note">
                  ✨ No credit card required • 14-day free trial • Cancel anytime
                </p>
              </form>
            )}
            <div className="cta-guarantees">
              <div className="guarantee-item">
                <span className="guarantee-icon">💳</span>
                <span>No Credit Card Required</span>
              </div>
              <div className="guarantee-item">
                <span className="guarantee-icon">🔒</span>
                <span>100% Secure & Private</span>
              </div>
              <div className="guarantee-item">
                <span className="guarantee-icon">↩️</span>
                <span>30-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">${config.name}</h3>
              <p>Transforming businesses through innovative technology and exceptional service.</p>
              <div className="social-links">
                <a href="#" aria-label="Twitter">🐦</a>
                <a href="#" aria-label="LinkedIn">💼</a>
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><a href="#api">API</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#documentation">Documentation</a></li>
                <li><a href="#community">Community</a></li>
                <li><a href="#status">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ${config.name}. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
}
