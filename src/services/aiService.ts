import type { GeneratedCode } from './types';

export type { GeneratedCode } from './types';

export const generateWebsite = async (userPrompt: string): Promise<GeneratedCode> => {
  console.log('🎯 Generating unique website for prompt:', userPrompt);
  
  // Enhanced prompt analysis for better website generation
  const enhancedPrompt = `
You are a world-class AI web application generator specializing in creating unique, production-ready websites.

USER REQUEST: "${userPrompt}"

CRITICAL REQUIREMENTS:
1. Create a COMPLETELY UNIQUE website - never use generic templates
2. Use a modern, elegant DARK THEME with visually appealing color accents
3. Apply stylish, readable fonts and professional layout
4. Include ALL features specifically requested by the user
5. Make it fully responsive and accessible
6. Add modern UI elements: hover effects, shadows, animations
7. Ensure all navigation is clearly visible on dark background

ANALYSIS & IMPLEMENTATION:
- Analyze the user's request for: website type, target audience, required features, style preferences
- Generate unique content, sections, and functionality based on their specific needs
- Implement advanced features as requested: forms, product listings, search, cart, reviews, etc.
- Use appropriate color schemes, typography, and layout for the website type
- Create engaging, interactive elements that match the brand/purpose

OUTPUT REQUIREMENTS:
- Provide clean, well-structured React code ready for Sandpack preview
- Use modern CSS/Tailwind for styling with dark theme
- Include all requested functionality and features
- Make it production-ready and fully functional
- No generic content - everything should be tailored to the request

Generate a complete React application with all necessary components and styling.
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || 'gsk_your_api_key_here'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: enhancedPrompt
          },
          {
            role: 'user',
            content: `Generate a unique, production-ready website for: ${userPrompt}`
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';
    
    // Parse and structure the generated code
    return parseGeneratedCode(generatedContent, userPrompt);
    
  } catch (error) {
    console.error('❌ API generation failed, using enhanced fallback:', error);
    return generateEnhancedFallback(userPrompt);
  }
};

const parseGeneratedCode = (content: string, userPrompt: string): GeneratedCode => {
  console.log('📝 Parsing generated content...');
  
  // Enhanced parsing logic for better code extraction
  const codeBlocks = extractCodeBlocks(content);
  
  if (codeBlocks.length === 0) {
    console.log('⚠️ No code blocks found, generating structured fallback');
    return generateEnhancedFallback(userPrompt);
  }
  
  const files: GeneratedCode = {};
  
  // Process each code block and assign to appropriate files
  codeBlocks.forEach((block, index) => {
    const { language, code, filename } = block;
    
    if (language === 'jsx' || language === 'tsx' || language === 'javascript') {
      if (filename) {
        files[filename] = { code };
      } else if (index === 0) {
        files['/src/App.js'] = { code };
      } else {
        files[`/src/Component${index}.js`] = { code };
      }
    } else if (language === 'css') {
      files['/src/App.css'] = { code };
    } else if (language === 'html') {
      files['/public/index.html'] = { code };
    }
  });
  
  // Ensure required files exist
  if (!files['/src/App.js']) {
    files['/src/App.js'] = { code: generateMainComponent(userPrompt) };
  }
  
  if (!files['/src/index.js']) {
    files['/src/index.js'] = { 
      code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);` 
    };
  }
  
  if (!files['/src/App.css']) {
    files['/src/App.css'] = { code: generateModernCSS(userPrompt) };
  }
  
  if (!files['/public/index.html']) {
    files['/public/index.html'] = { code: generateHTML(userPrompt) };
  }
  
  return files;
};

const extractCodeBlocks = (content: string) => {
  const codeBlockRegex = /```(\w+)?\s*(?:\/\*\s*(.+?)\s*\*\/)?\s*\n([\s\S]*?)```/g;
  const blocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'javascript',
      filename: match[2] || null,
      code: match[3].trim()
    });
  }
  
  return blocks;
};

const generateEnhancedFallback = (userPrompt: string): GeneratedCode => {
  console.log('🔧 Generating enhanced fallback for:', userPrompt);
  
  // Analyze user prompt for website type and features
  const websiteType = detectWebsiteType(userPrompt);
  const features = extractFeatures(userPrompt);
  
  return {
    '/src/App.js': { code: generateMainComponent(userPrompt, websiteType, features) },
    '/src/index.js': { 
      code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);` 
    },
    '/src/App.css': { code: generateModernCSS(userPrompt, websiteType) },
    '/public/index.html': { code: generateHTML(userPrompt, websiteType) },
    '/package.json': { 
      code: `{
  "name": "${websiteType.toLowerCase().replace(/\s+/g, '-')}-website",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}` 
    }
  };
};

const detectWebsiteType = (prompt: string): string => {
  const types = {
    'e-commerce': ['ecommerce', 'e-commerce', 'shop', 'store', 'product', 'sneaker', 'clothing', 'buy', 'sell', 'cart'],
    'portfolio': ['portfolio', 'showcase', 'gallery', 'artist', 'designer', 'photographer', 'creative'],
    'business': ['business', 'company', 'corporate', 'professional', 'service', 'consulting'],
    'healthcare': ['healthcare', 'medical', 'clinic', 'doctor', 'hospital', 'health'],
    'restaurant': ['restaurant', 'food', 'cafe', 'dining', 'menu', 'kitchen'],
    'blog': ['blog', 'news', 'article', 'content', 'writing'],
    'landing': ['landing', 'startup', 'launch', 'marketing', 'conversion'],
    'education': ['education', 'learning', 'course', 'school', 'university', 'tutorial']
  };
  
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }
  
  return 'Modern Website';
};

const extractFeatures = (prompt: string): string[] => {
  const features = [];
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('cart') || lowerPrompt.includes('shopping')) features.push('shopping-cart');
  if (lowerPrompt.includes('search') || lowerPrompt.includes('filter')) features.push('search-filter');
  if (lowerPrompt.includes('review') || lowerPrompt.includes('rating')) features.push('reviews');
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('form')) features.push('contact-form');
  if (lowerPrompt.includes('gallery') || lowerPrompt.includes('image')) features.push('gallery');
  if (lowerPrompt.includes('login') || lowerPrompt.includes('auth')) features.push('authentication');
  if (lowerPrompt.includes('booking') || lowerPrompt.includes('appointment')) features.push('booking');
  if (lowerPrompt.includes('testimonial')) features.push('testimonials');
  if (lowerPrompt.includes('blog') || lowerPrompt.includes('news')) features.push('blog');
  
  return features;
};

const generateMainComponent = (prompt: string, websiteType = 'Modern Website', features = []): string => {
  const isEcommerce = websiteType.toLowerCase().includes('commerce') || features.includes('shopping-cart');
  const hasSearch = features.includes('search-filter');
  const hasReviews = features.includes('reviews');
  const hasGallery = features.includes('gallery');
  
  if (isEcommerce) {
    return `import React, { useState } from 'react';

function App() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products = [
    { id: 1, name: 'Nike Air Max 270', price: 150, category: 'nike', image: '🏃‍♂️', rating: 4.8, reviews: 124 },
    { id: 2, name: 'Adidas Ultra Boost', price: 180, category: 'adidas', image: '👟', rating: 4.9, reviews: 89 },
    { id: 3, name: 'Jordan 1 Retro', price: 170, category: 'jordan', image: '🏀', rating: 4.7, reviews: 156 },
    { id: 4, name: 'Converse Chuck Taylor', price: 65, category: 'converse', image: '👟', rating: 4.5, reviews: 203 },
    { id: 5, name: 'Vans Old Skool', price: 60, category: 'vans', image: '🛹', rating: 4.6, reviews: 178 },
    { id: 6, name: 'Puma RS-X', price: 110, category: 'puma', image: '⚡', rating: 4.4, reviews: 92 }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1 className="logo">SneakerStore</h1>
          <nav className="nav">
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="cart-icon">
            🛒 <span className="cart-count">{cart.length}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2 className="hero-title">Step Into Style</h2>
          <p className="hero-subtitle">Discover the latest collection of premium sneakers</p>
          <button className="cta-button">Shop Now</button>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="filters">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search sneakers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filters">
            <button 
              className={\`filter-btn \${selectedCategory === 'all' ? 'active' : ''}\`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            <button 
              className={\`filter-btn \${selectedCategory === 'nike' ? 'active' : ''}\`}
              onClick={() => setSelectedCategory('nike')}
            >
              Nike
            </button>
            <button 
              className={\`filter-btn \${selectedCategory === 'adidas' ? 'active' : ''}\`}
              onClick={() => setSelectedCategory('adidas')}
            >
              Adidas
            </button>
            <button 
              className={\`filter-btn \${selectedCategory === 'jordan' ? 'active' : ''}\`}
              onClick={() => setSelectedCategory('jordan')}
            >
              Jordan
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">{product.image}</div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-rating">
                    ⭐ {product.rating} ({product.reviews} reviews)
                  </div>
                  <div className="product-price">\${product.price}</div>
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

      {/* Cart Summary */}
      {cart.length > 0 && (
        <section className="cart-summary">
          <div className="container">
            <h3>Shopping Cart ({cart.length} items)</h3>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <span>{item.name}</span>
                  <span>\${item.price}</span>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              Total: \${getTotalPrice()}
            </div>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="reviews">
        <div className="container">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-rating">⭐⭐⭐⭐⭐</div>
              <p>"Amazing quality and fast delivery! Love my new sneakers."</p>
              <div className="review-author">- Sarah M.</div>
            </div>
            <div className="review-card">
              <div className="review-rating">⭐⭐⭐⭐⭐</div>
              <p>"Best sneaker store online. Great customer service!"</p>
              <div className="review-author">- Mike R.</div>
            </div>
            <div className="review-card">
              <div className="review-rating">⭐⭐⭐⭐⭐</div>
              <p>"Perfect fit and stylish designs. Highly recommended!"</p>
              <div className="review-author">- Emma L.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About SneakerStore</h4>
              <p>Your premier destination for authentic sneakers and streetwear.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>📧 info@sneakerstore.com</p>
              <p>📞 (555) 123-4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 SneakerStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
  }
  
  // Generate other website types based on prompt analysis
  return generateCustomWebsite(prompt, websiteType, features);
};

const generateCustomWebsite = (prompt: string, websiteType: string, features: string[]): string => {
  // This would generate different website types based on the analysis
  return `import React, { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="logo">${websiteType}</h1>
          <nav className="nav">
            <a href="#home" onClick={() => setActiveSection('home')}>Home</a>
            <a href="#about" onClick={() => setActiveSection('about')}>About</a>
            <a href="#services" onClick={() => setActiveSection('services')}>Services</a>
            <a href="#contact" onClick={() => setActiveSection('contact')}>Contact</a>
          </nav>
        </div>
      </header>

      <main className="main">
        {activeSection === 'home' && (
          <section className="hero">
            <div className="hero-content">
              <h2 className="hero-title">Welcome to ${websiteType}</h2>
              <p className="hero-subtitle">Professional, modern, and tailored to your needs</p>
              <button className="cta-button">Get Started</button>
            </div>
          </section>
        )}

        {activeSection === 'about' && (
          <section className="about">
            <div className="container">
              <h2 className="section-title">About Us</h2>
              <p>We are dedicated to providing exceptional service and solutions.</p>
            </div>
          </section>
        )}

        {activeSection === 'services' && (
          <section className="services">
            <div className="container">
              <h2 className="section-title">Our Services</h2>
              <div className="services-grid">
                <div className="service-card">
                  <h3>Premium Service</h3>
                  <p>High-quality solutions tailored to your needs.</p>
                </div>
                <div className="service-card">
                  <h3>Expert Support</h3>
                  <p>Professional assistance when you need it most.</p>
                </div>
                <div className="service-card">
                  <h3>Custom Solutions</h3>
                  <p>Personalized approaches for unique requirements.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'contact' && (
          <section className="contact">
            <div className="container">
              <h2 className="section-title">Contact Us</h2>
              <div className="contact-form">
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Your Email" />
                <textarea placeholder="Your Message"></textarea>
                <button type="submit">Send Message</button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 ${websiteType}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
};

const generateModernCSS = (prompt: string, websiteType = 'Modern Website'): string => {
  return `/* Modern Dark Theme Styling */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #e2e8f0;
  line-height: 1.6;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.header {
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 20px;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav a {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav a:hover {
  color: #667eea;
  transform: translateY(-2px);
}

.nav a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.nav a:hover::after {
  width: 100%;
}

/* Cart Icon */
.cart-icon {
  position: relative;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cart-icon:hover {
  transform: scale(1.1);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 6rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

/* Filters Section */
.filters {
  background: rgba(15, 15, 35, 0.8);
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filters .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.search-bar input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 0.8rem 1.5rem;
  color: #e2e8f0;
  font-size: 1rem;
  width: 300px;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.search-bar input::placeholder {
  color: #94a3b8;
}

.category-filters {
  display: flex;
  gap: 1rem;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #cbd5e1;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.filter-btn:hover,
.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
}

/* Products Section */
.products {
  padding: 4rem 0;
  flex: 1;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.product-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(102, 126, 234, 0.3);
}

.product-image {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
}

.product-name {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
}

.product-rating {
  color: #fbbf24;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}

/* Cart Summary */
.cart-summary {
  background: rgba(15, 15, 35, 0.9);
  padding: 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-items {
  margin: 1rem 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-total {
  font-size: 1.3rem;
  font-weight: 700;
  color: #667eea;
  margin: 1rem 0;
}

.checkout-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* Reviews Section */
.reviews {
  background: rgba(15, 15, 35, 0.5);
  padding: 4rem 0;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.review-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.review-rating {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.review-author {
  color: #94a3b8;
  font-style: italic;
  margin-top: 1rem;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.service-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.service-card h3 {
  color: #667eea;
  margin-bottom: 1rem;
}

/* Contact Form */
.contact-form {
  max-width: 600px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  color: #e2e8f0;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.contact-form textarea {
  min-height: 120px;
  resize: vertical;
}

.contact-form button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.contact-form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

/* Footer */
.footer {
  background: rgba(15, 15, 35, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: #667eea;
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #667eea;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    gap: 1rem;
  }
  
  .filters .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-bar input {
    width: 100%;
  }
  
  .category-filters {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
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

.product-card,
.service-card,
.review-card {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 15, 35, 0.5);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4e8a 100%);
}`;
};

const generateHTML = (prompt: string, websiteType = 'Modern Website'): string => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0f0f23" />
    <meta name="description" content="${websiteType} - Modern, responsive web application" />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <title>${websiteType}</title>
    
    <style>
      /* Loading animation */
      .loading-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }
      
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(102, 126, 234, 0.3);
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loaded .loading-container {
        opacity: 0;
        pointer-events: none;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    
    <!-- Loading Screen -->
    <div class="loading-container">
      <div class="loading-spinner"></div>
    </div>
    
    <div id="root"></div>
    
    <script>
      // Hide loading screen when app loads
      window.addEventListener('load', () => {
        setTimeout(() => {
          document.body.classList.add('loaded');
        }, 500);
      });
    </script>
  </body>
</html>`;
};
