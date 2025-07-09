import { ENHANCED_SYSTEM_PROMPT, generateEnhancedPrompt, analyzeUserInput } from './enhanced/promptTemplates';
import { checkCodeQuality, enhanceCodeQuality } from './enhanced/codeQualityChecker';

// Updated API Configuration with proper CORS handling
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = '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';

export interface GeneratedCode {
  [filename: string]: { code: string };
}

// Type guard to check if an object has the expected FileContent structure
function isFileContent(obj: unknown): obj is { code: string } {
  return typeof obj === 'object' && obj !== null && 'code' in obj && typeof (obj as any).code === 'string';
}

// Enhanced API call with proper CORS handling and retry logic
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
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // Updated to latest stable model
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
        temperature: 0.2, // Slightly higher for more creativity
        max_tokens: 8000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GROQ API Error:', response.status, errorText);
      
      // Handle specific CORS errors
      if (response.status === 0 || errorText.includes('CORS')) {
        throw new Error('CORS_ERROR');
      }
      
      throw new Error(`GROQ API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response structure');
    }
    
    const content = data.choices[0].message.content;
    
    console.log('✅ Enhanced GROQ API response received, length:', content.length);
    console.log('📄 Response preview:', content.substring(0, 300) + '...');
    
    return content;
  } catch (error) {
    console.error(`❌ Enhanced GROQ API call failed (attempt ${retryCount + 1}):`, error);
    
    // Handle CORS errors specifically
    if (error instanceof Error && error.message === 'CORS_ERROR') {
      console.log('🔄 CORS error detected, falling back to intelligent generation');
      throw new Error('CORS_FALLBACK');
    }
    
    if (retryCount < 2 && (error instanceof Error && (error.message.includes('network') || error.message.includes('timeout')))) {
      console.log('🔄 Retrying GROQ API call...');
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return callGroqAPI(userMessage, retryCount + 1);
    }
    
    throw error;
  }
}

// Enhanced JSON parsing with more robust cleaning
function parseCodeResponse(response: string): GeneratedCode {
  try {
    console.log('🔍 Parsing enhanced website response...');
    console.log('Raw response length:', response.length);
    
    let cleanedResponse = response.trim();
    
    // Remove any explanatory text before JSON
    const jsonStart = cleanedResponse.search(/\{[\s\n]*["\']?\//);
    if (jsonStart > 0) {
      cleanedResponse = cleanedResponse.substring(jsonStart);
    }
    
    // Remove any text after the JSON object
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = 0; i < cleanedResponse.length; i++) {
      if (cleanedResponse[i] === '{') braceCount++;
      if (cleanedResponse[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }
    
    if (jsonEnd > 0) {
      cleanedResponse = cleanedResponse.substring(0, jsonEnd + 1);
    }
    
    // Remove markdown code blocks completely
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```javascript\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
    cleanedResponse = cleanedResponse.replace(/^```.*$/gm, '');
    
    // Fix double-encoded JSON - this is the main source of parsing errors
    cleanedResponse = cleanedResponse.replace(/"code":\s*"(\{[^}]*\}[^"]*)"/, (match, content) => {
      // This handles cases where the code is double-encoded as JSON string
      try {
        const unescaped = JSON.parse(`"${content}"`);
        const reescaped = JSON.stringify(unescaped);
        return `"code": ${reescaped}`;
      } catch {
        return match;
      }
    });
    
    // Fix nested quotes and escape sequences
    cleanedResponse = cleanedResponse.replace(/"code":\s*"([^"]*(?:\\.[^"]*)*)"(?=\s*[,}])/g, (match, content) => {
      // Properly handle escaped content
      const unescapedContent = content
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      
      // Re-escape for JSON
      const reescapedContent = JSON.stringify(unescapedContent);
      
      return `"code": ${reescapedContent}`;
    });
    
    // Remove template literals that might cause issues
    cleanedResponse = cleanedResponse.replace(/`([^`]*)`/g, (match, content) => {
      return JSON.stringify(content);
    });
    
    // Clean up any remaining invalid characters
    cleanedResponse = cleanedResponse.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    // Final validation before parsing
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
    'game': 'Epic Gaming Hub',
    'gaming': 'Gaming Paradise',
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
    case 'game':
    case 'gaming':
      return generateGamingWebsite(config);
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

function generateGamingWebsite(config: any): string {
  return `import React, { useState, useEffect } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [leaderboard, setLeaderboard] = useState([
    { id: 1, name: 'ProGamer123', score: 2450, rank: 1 },
    { id: 2, name: 'EliteSniper', score: 2380, rank: 2 },
    { id: 3, name: 'GameMaster', score: 2120, rank: 3 },
    { id: 4, name: 'PixelWarrior', score: 1980, rank: 4 },
    { id: 5, name: 'CyberNinja', score: 1850, rank: 5 }
  ]);
  const [gameStats, setGameStats] = useState({
    totalPlayers: 150000,
    onlineNow: 8542,
    gamesPlayed: 2500000
  });

  const games = [
    {
      id: 1,
      title: 'Battle Royale Arena',
      genre: 'Action/Battle Royale',
      players: '100 players',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
      description: 'Last player standing wins in this intense battle royale experience'
    },
    {
      id: 2,
      title: 'Space Commander',
      genre: 'Strategy/Sci-Fi',
      players: '1-4 players',
      image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&h=600&fit=crop',
      description: 'Command your fleet across the galaxy in epic space battles'
    },
    {
      id: 3,
      title: 'Mystic Legends',
      genre: 'RPG/Fantasy',
      players: 'MMO',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      description: 'Embark on magical quests in a vast fantasy world'
    },
    {
      id: 4,
      title: 'Speed Racers',
      genre: 'Racing/Sports',
      players: '1-8 players',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      description: 'High-speed racing action with customizable vehicles'
    }
  ];

  const tournaments = [
    {
      id: 1,
      title: 'Championship Finals',
      prize: '$50,000',
      date: '2024-01-15',
      participants: 256,
      status: 'Registration Open'
    },
    {
      id: 2,
      title: 'Weekly Arena',
      prize: '$5,000',
      date: '2024-01-08',
      participants: 64,
      status: 'In Progress'
    },
    {
      id: 3,
      title: 'Rookie Cup',
      prize: '$1,000',
      date: '2024-01-10',
      participants: 128,
      status: 'Registration Open'
    }
  ];

  return (
    <div className="gaming-website">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🎮</span>
            <h1>${config.name}</h1>
          </div>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => setActiveSection('home')} className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="#games" onClick={() => setActiveSection('games')} className={activeSection === 'games' ? 'active' : ''}>Games</a></li>
            <li><a href="#tournaments" onClick={() => setActiveSection('tournaments')} className={activeSection === 'tournaments' ? 'active' : ''}>Tournaments</a></li>
            <li><a href="#leaderboard" onClick={() => setActiveSection('leaderboard')} className={activeSection === 'leaderboard' ? 'active' : ''}>Leaderboard</a></li>
            <li><a href="#community" onClick={() => setActiveSection('community')} className={activeSection === 'community' ? 'active' : ''}>Community</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn-secondary">Login</button>
            <button className="btn-primary">Join Now</button>
          </div>
        </div>
      </nav>

      {activeSection === 'home' && (
        <section className="hero-section">
          <div className="hero-background">
            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=1080&fit=crop" alt="Gaming background" className="hero-bg-image" />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Welcome to the Ultimate Gaming Experience</h1>
              <p className="hero-subtitle">Join millions of players in epic battles, tournaments, and adventures</p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">{gameStats.totalPlayers.toLocaleString()}</span>
                  <span className="stat-label">Total Players</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{gameStats.onlineNow.toLocaleString()}</span>
                  <span className="stat-label">Online Now</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{gameStats.gamesPlayed.toLocaleString()}</span>
                  <span className="stat-label">Games Played</span>
                </div>
              </div>
              <div className="hero-buttons">
                <button className="btn-primary btn-large" onClick={() => setActiveSection('games')}>
                  Play Now
                </button>
                <button className="btn-secondary btn-large" onClick={() => setActiveSection('tournaments')}>
                  Join Tournament
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'games' && (
        <section className="games-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Featured Games</h2>
              <p className="section-subtitle">Discover our most popular gaming experiences</p>
            </div>
            <div className="games-grid">
              {games.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-image">
                    <img src={game.image} alt={game.title} />
                    <div className="game-overlay">
                      <button className="play-btn">▶ Play Now</button>
                    </div>
                  </div>
                  <div className="game-info">
                    <div className="game-genre">{game.genre}</div>
                    <h3 className="game-title">{game.title}</h3>
                    <p className="game-description">{game.description}</p>
                    <div className="game-meta">
                      <span className="game-players">{game.players}</span>
                      <div className="game-rating">
                        ⭐⭐⭐⭐⭐ 4.8
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'tournaments' && (
        <section className="tournaments-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Active Tournaments</h2>
              <p className="section-subtitle">Compete for glory and amazing prizes</p>
            </div>
            <div className="tournaments-grid">
              {tournaments.map(tournament => (
                <div key={tournament.id} className="tournament-card">
                  <div className="tournament-header">
                    <h3 className="tournament-title">{tournament.title}</h3>
                    <div className={\`tournament-status \${tournament.status.toLowerCase().replace(' ', '-')}\`}>
                      {tournament.status}
                    </div>
                  </div>
                  <div className="tournament-info">
                    <div className="tournament-prize">
                      <span className="prize-label">Prize Pool</span>
                      <span className="prize-amount">{tournament.prize}</span>
                    </div>
                    <div className="tournament-details">
                      <div className="detail-item">
                        <span>📅 {tournament.date}</span>
                      </div>
                      <div className="detail-item">
                        <span>👥 {tournament.participants} participants</span>
                      </div>
                    </div>
                  </div>
                  <button className="tournament-btn">
                    {tournament.status === 'Registration Open' ? 'Register Now' : 'View Details'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'leaderboard' && (
        <section className="leaderboard-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Global Leaderboard</h2>
              <p className="section-subtitle">Top players from around the world</p>
            </div>
            <div className="leaderboard-container">
              <div className="leaderboard-table">
                <div className="table-header">
                  <div className="rank-col">Rank</div>
                  <div className="player-col">Player</div>
                  <div className="score-col">Score</div>
                  <div className="badge-col">Badge</div>
                </div>
                {leaderboard.map(player => (
                  <div key={player.id} className="player-row">
                    <div className="rank-col">
                      <span className={\`rank-badge rank-\${player.rank}\`}>#{player.rank}</span>
                    </div>
                    <div className="player-col">
                      <div className="player-avatar">🎮</div>
                      <span className="player-name">{player.name}</span>
                    </div>
                    <div className="score-col">
                      <span className="player-score">{player.score.toLocaleString()}</span>
                    </div>
                    <div className="badge-col">
                      {player.rank === 1 && <span className="badge gold">👑 Champion</span>}
                      {player.rank === 2 && <span className="badge silver">🥈 Elite</span>}
                      {player.rank === 3 && <span className="badge bronze">🥉 Pro</span>}
                      {player.rank > 3 && <span className="badge">⭐ Player</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'community' && (
        <section className="community-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Join Our Community</h2>
              <p className="section-subtitle">Connect with fellow gamers worldwide</p>
            </div>
            <div className="community-features">
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Forums</h3>
                <p>Discuss strategies, share tips, and connect with other players</p>
                <button className="feature-btn">Join Discussion</button>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📺</div>
                <h3>Live Streams</h3>
                <p>Watch live gameplay and tournaments from top players</p>
                <button className="feature-btn">Watch Now</button>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Clans & Teams</h3>
                <p>Form alliances and compete together in team events</p>
                <button className="feature-btn">Find Team</button>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📰</div>
                <h3>News & Updates</h3>
                <p>Stay updated with the latest game news and patches</p>
                <button className="feature-btn">Read More</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Games</h4>
              <ul>
                <li><a href="#">Battle Royale Arena</a></li>
                <li><a href="#">Space Commander</a></li>
                <li><a href="#">Mystic Legends</a></li>
                <li><a href="#">Speed Racers</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Community</h4>
              <ul>
                <li><a href="#">Forums</a></li>
                <li><a href="#">Discord</a></li>
                <li><a href="#">Reddit</a></li>
                <li><a href="#">Twitch</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Bug Reports</a></li>
                <li><a href="#">System Requirements</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ${config.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
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
  if (config.type === 'game' || config.type === 'gaming') {
    return generateGamingCSS();
  }
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

function generateGamingCSS(): string {
  return `/* Gaming Website Dark Theme CSS */
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
  overflow-x: hidden;
}

.gaming-website {
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
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
  cursor: pointer;
}

.nav-menu a:hover,
.nav-menu a.active {
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

.nav-menu a:hover::after,
.nav-menu a.active::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #4ecdc4;
  border: 2px solid #4ecdc4;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(78, 205, 196, 0.1);
  transform: translateY(-2px);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 26, 46, 0.7) 50%, rgba(22, 33, 62, 0.8) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #ffffff, #4ecdc4, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(78, 205, 196, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #4ecdc4;
  text-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Section Layouts */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffffff, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
}

.games-section,
.tournaments-section,
.leaderboard-section,
.community-section {
  padding: 6rem 0;
  min-height: 100vh;
}

/* Games Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(78, 205, 196, 0.2);
}

.game-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.game-card:hover .game-image img {
  transform: scale(1.1);
}

.play-btn {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.05);
}

.game-info {
  padding: 1.5rem;
}

.game-genre {
  color: #4ecdc4;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.game-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: #ffffff;
}

.game-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-players {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.game-rating {
  color: #ffd700;
  font-size: 0.9rem;
}

/* Tournaments */
.tournaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tournament-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.tournament-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.2);
}

.tournament-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.tournament-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.tournament-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tournament-status.registration-open {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
  border: 1px solid #4ecdc4;
}

.tournament-status.in-progress {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.tournament-info {
  margin-bottom: 2rem;
}

.tournament-prize {
  text-align: center;
  margin-bottom: 1.5rem;
}

.prize-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.prize-amount {
  font-size: 2rem;
  font-weight: 800;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.tournament-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  color: rgba(255, 255, 255, 0.7);
}

.tournament-btn {
  width: 100%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tournament-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
}

/* Leaderboard */
.leaderboard-container {
  max-width: 800px;
  margin: 0 auto;
}

.leaderboard-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: #4ecdc4;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.player-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.3s ease;
}

.player-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.player-row:last-child {
  border-bottom: none;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: 800;
  font-size: 1.1rem;
}

.rank-badge.rank-1 {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #000;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.rank-badge.rank-2 {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #000;
}

.rank-badge.rank-3 {
  background: linear-gradient(45deg, #cd7f32, #d4894a);
  color: #fff;
}

.rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.player-col {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.player-name {
  font-weight: 600;
  color: #ffffff;
}

.player-score {
  font-weight: 700;
  color: #4ecdc4;
  font-size: 1.1rem;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.gold {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.badge.silver {
  background: rgba(192, 192, 192, 0.2);
  color: #c0c0c0;
}

.badge.bronze {
  background: rgba(205, 127, 50, 0.2);
  color: #cd7f32;
}

.badge:not(.gold):not(.silver):not(.bronze) {
  background: rgba(78, 205, 196, 0.2);
  color: #4ecdc4;
}

/* Community Features */
.community-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(78, 205, 196, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.feature-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.feature-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(78, 205, 196, 0.3);
}

/* Footer */
.footer {
  background: rgba(10, 10, 10, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rem 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-section h4 {
  color: #4ecdc4;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #4ecdc4;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-stats {
    gap: 2rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
    font-size: 0.9rem;
  }
  
  .nav-actions {
    gap: 0.5rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-large {
    width: 100%;
    max-width: 300px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .games-grid,
  .tournaments-grid,
  .community-features {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .player-row {
    grid-template-columns: 60px 1fr 80px 80px;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .player-name,
  .player-score {
    font-size: 0.9rem;
  }
  
  .tournament-header {
    flex-direction: column;
    gap: 1rem;
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
    try {
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
    } catch (apiError) {
      if (apiError instanceof Error && apiError.message === 'CORS_FALLBACK') {
        console.log('🎯 CORS detected, using intelligent fallback');
        return createIntelligentFallback(userMessage);
      }
      throw apiError;
    }
  } catch (error) {
    console.error('❌ Enhanced website generation failed, creating intelligent fallback:', error);
    return createIntelligentFallback(userMessage);
  }
}
