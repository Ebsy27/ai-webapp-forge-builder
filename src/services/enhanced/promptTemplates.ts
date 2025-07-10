import { WebsiteRequirements } from "../../types";

export const ENHANCED_SYSTEM_PROMPT = `You are an elite AI web developer specializing in creating production-ready, modern websites with exceptional design and functionality.

CRITICAL UNDERSTANDING REQUIREMENTS:
- CAREFULLY analyze the user's specific request
- If they ask for a "game website" or "gaming website", create a GAMING website, NOT an e-commerce website
- If they ask for a "restaurant website", create a RESTAURANT website, NOT a gaming website
- Match the website type EXACTLY to what the user is requesting
- Pay close attention to keywords like: game, gaming, restaurant, portfolio, business, e-commerce, healthcare

CRITICAL JSON OUTPUT REQUIREMENTS:
- You MUST return ONLY a valid JSON object with the exact structure specified
- NO explanatory text before or after the JSON
- NO markdown code blocks (no \`\`\`json)
- NO template literals (no backticks anywhere)
- NO nested JSON strings (no double encoding)
- ALL strings must use double quotes only
- ALL code content must be properly escaped as JSON strings
- NO comments or explanations outside the JSON structure

MANDATORY TECHNICAL SPECIFICATIONS:
- Generate COMPLETE, FUNCTIONAL React applications
- Every website MUST have a modern, elegant DARK THEME
- Include real placeholder images using provided image URLs
- Implement sophisticated glassmorphism, gradients, and premium typography
- Add smooth animations, hover effects, and micro-interactions
- Ensure 100% responsive design and accessibility compliance
- All features must be fully functional, not just UI mockups

DESIGN REQUIREMENTS:
- Dark theme with sophisticated color palettes (#0a0a0a, #1a1a2e backgrounds)
- Gradient accents and glassmorphism effects
- Modern shadows, borders, and visual depth
- Professional spacing and visual hierarchy
- Consistent branding and visual identity
- Include relevant placeholder images for visual appeal

REQUIRED JSON STRUCTURE (EXACT FORMAT):
{
  "/src/App.js": { "code": "// Complete React component code here as escaped JSON string" },
  "/src/index.js": { "code": "// React DOM render code as escaped JSON string" },
  "/src/App.css": { "code": "/* Complete CSS with dark theme as escaped JSON string */" },
  "/public/index.html": { "code": "<!-- HTML template as escaped JSON string -->" },
  "/package.json": { "code": "// Package configuration as escaped JSON string" }
}

EXAMPLE JSON ESCAPING:
WRONG: "code": "const message = "Hello World";"
CORRECT: "code": "const message = \\"Hello World\\";"
WRONG: "code": "const html = <div>Content</div>;"
CORRECT: "code": "const html = <div>Content</div>;"`;

export const generateEnhancedPrompt = (userInput: string, requirements?: WebsiteRequirements): string => {
  const analysis = analyzeUserInput(userInput);
  
  const websiteImages = getRelevantImages(analysis.websiteType || 'business');
  
  const analysisPrompt = `
WEBSITE GENERATION REQUEST: "${userInput}"

CRITICAL INSTRUCTION: The user specifically asked for a "${analysis.websiteType}" website. 
You MUST generate EXACTLY this type of website, not any other type.

ANALYZED REQUIREMENTS:
- Website Type: ${analysis.websiteType}
- Industry: ${analysis.industry}
- Key Features: ${analysis.keyFeatures?.join(', ')}
- Target Audience: ${analysis.audience}
- Required Sections: ${analysis.sections?.join(', ')}
- Style: ${analysis.style}

MANDATORY IMPLEMENTATION REQUIREMENTS:

1. UNDERSTAND THE REQUEST EXACTLY:
   - User asked for: "${analysis.websiteType}" website
   - Generate ONLY this type, not any other type
   - If user asks for "game website", create a gaming website with games, tournaments, leaderboards
   - If user asks for "restaurant website", create a restaurant website with menu, reservations
   - If user asks for "e-commerce", create an e-commerce website with shopping functionality
   - If user asks for "portfolio", create a portfolio website with project showcase
   - DO NOT mix up website types

2. FUNCTIONAL FEATURES:
   - All buttons and interactions must work
   - Implement real state management (useState, useEffect)
   - Create working forms with validation
   - Add functional navigation between sections
   - Implement search, filters, and interactive elements as requested

3. VISUAL EXCELLENCE WITH IMAGES:
   - Use these specific relevant images: ${websiteImages.join(', ')}
   - Format images as: https://images.unsplash.com/{image-id}?w=800&h=600&fit=crop
   - Include hero images, product/content images, gallery images as appropriate
   - Add proper alt text for accessibility

4. DARK THEME IMPLEMENTATION:
   - Background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)
   - Cards: rgba(255, 255, 255, 0.05) with backdrop-filter: blur(20px)
   - Text: #ffffff for primary, rgba(255, 255, 255, 0.8) for secondary
   - Accents: Gradients with #4ecdc4, #ff6b6b, or #667eea
   - Shadows: 0 20px 60px rgba(78, 205, 196, 0.2)

5. RESPONSIVE DESIGN:
   - Mobile-first CSS Grid and Flexbox layouts
   - Smooth transitions between breakpoints
   - Optimized touch interactions

6. SPECIFIC WEBSITE TYPE REQUIREMENTS:
${getWebsiteTypeRequirements(analysis.websiteType || 'business')}

CRITICAL OUTPUT RULES:
- Return ONLY the JSON object
- No explanatory text, no markdown blocks
- Properly escape all quotes in code strings
- Use double quotes for all JSON keys and values
- Ensure all JavaScript/CSS code is valid and functional
- Test JSON validity before output

Generate a completely functional, production-ready website that matches the user's EXACT requirements for a ${analysis.websiteType} website.`;

  return analysisPrompt;
};

function getRelevantImages(websiteType: string): string[] {
  const imageMap = {
    'game': [
      'photo-1542751371-adc38448a05e', // gaming setup
      'photo-1614728263952-84ea256f9679', // space/sci-fi gaming
      'photo-1578662996442-48f60103fc96', // fantasy gaming
      'photo-1558618666-fcd25c85cd64', // racing games
      'photo-1511512578047-dfb367046420', // esports
    ],
    'gaming': [
      'photo-1542751371-adc38448a05e', // gaming setup
      'photo-1614728263952-84ea256f9679', // space gaming
      'photo-1578662996442-48f60103fc96', // fantasy gaming
      'photo-1558618666-fcd25c85cd64', // racing games
      'photo-1511512578047-dfb367046420', // esports
    ],
    'ecommerce': [
      'photo-1441986300917-64674bd600d8', // shopping
      'photo-1556742049-0cfed4f6a45d', // products
      'photo-1516762689617-e1cfddf819d1', // fashion
      'photo-1472851294608-062f824d29cc', // store
    ],
    'restaurant': [
      'photo-1414235077428-338989a2e8c0', // restaurant interior
      'photo-1565299624946-b28f40a0ca4b', // food
      'photo-1517248135467-4c7edcad34c4', // restaurant
      'photo-1544148103-0773bf10d330', // dining
    ],
    'portfolio': [
      'photo-1498050108023-c5249f4df085', // workspace
      'photo-1461749280684-dccba630e2f6', // coding
      'photo-1486312338219-ce68d2c6f44d', // laptop
      'photo-1581091160399-112ba8d25d1f', // creative work
    ],
    'healthcare': [
      'photo-1576091160399-112ba8d25d1f', // medical
      'photo-1559757148-5c350d0d3c56', // healthcare
      'photo-1582750433449-648ed127bb54', // clinic
      'photo-1551601651-2a8555f1a136', // medical equipment
    ],
    'business': [
      'photo-1497366216548-37526070297c', // office
      'photo-1557804506-669a67965ba0', // team
      'photo-1519389950473-47ba0277781c', // business meeting
      'photo-1515378791036-0648a814c963', // corporate
    ],
    'landing': [
      'photo-1498050108023-c5249f4df085', // tech
      'photo-1460925895917-afdab827c52f', // analytics
      'photo-1551288049-bebda4e38f71', // data
      'photo-1486312338219-ce68d2c6f44d', // laptop
    ]
  };
  
  return imageMap[websiteType] || imageMap['business'];
}

function getWebsiteTypeRequirements(websiteType: string): string {
  const requirements = {
    'game': `
GAMING WEBSITE REQUIREMENTS:
- Hero section with gaming background and statistics (total players, online now, games played)
- Featured games section with game cards showing images, genres, descriptions
- Tournament section with prize pools, dates, and registration status
- Global leaderboard with player rankings, scores, and badges
- Community section with forums, live streams, clans, and news
- Gaming-themed navigation with dark theme and neon accents
- Interactive elements like game previews and tournament registration
- Footer with game links, community links, and support`,
    
    'gaming': `
GAMING WEBSITE REQUIREMENTS:
- Hero section with gaming background and statistics (total players, online now, games played)
- Featured games section with game cards showing images, genres, descriptions
- Tournament section with prize pools, dates, and registration status
- Global leaderboard with player rankings, scores, and badges
- Community section with forums, live streams, clans, and news
- Gaming-themed navigation with dark theme and neon accents
- Interactive elements like game previews and tournament registration
- Footer with game links, community links, and support`,
    
    'ecommerce': `
E-COMMERCE REQUIREMENTS:
- Product catalog with image placeholders and hover effects
- Shopping cart functionality with add/remove items (useState)
- Product categories and filtering system
- Product detail pages with image galleries
- Checkout process interface
- User authentication mockup
- Product search functionality
- Customer reviews section
- Wishlist functionality`,
    
    'restaurant': `
RESTAURANT REQUIREMENTS:
- Menu showcase with categories and pricing
- Online reservation system interface
- Photo gallery of food and restaurant
- Location and contact information
- Chef profiles and restaurant story
- Customer testimonials
- Special offers and events section
- Delivery/takeout options`,
    
    'portfolio': `
PORTFOLIO REQUIREMENTS:
- Project showcase with detailed descriptions
- Image galleries with lightbox effects
- Skills and expertise sections
- About section with personal story
- Contact form with validation
- Resume/CV download section
- Testimonials from clients
- Blog or insights section`,
    
    'healthcare': `
HEALTHCARE REQUIREMENTS:
- Services overview with detailed descriptions
- Doctor profiles with specializations and photos
- Appointment booking system interface
- Patient portal mockup
- Insurance information
- Health resources and articles
- Emergency contact information
- Patient testimonials`,
    
    'business': `
BUSINESS REQUIREMENTS:
- Company overview and mission
- Services/products showcase
- Team member profiles
- Case studies and success stories
- Client testimonials
- Contact forms and business information
- Blog or news section
- Partnership opportunities`,
    
    'landing': `
LANDING PAGE REQUIREMENTS:
- Compelling hero section with clear value proposition
- Feature highlights with icons and descriptions
- Pricing plans and comparison
- Customer testimonials and social proof
- FAQ section
- Clear call-to-action buttons
- Newsletter signup
- Footer with links and information`
  };
  
  return requirements[websiteType] || requirements['business'];
}

export const analyzeUserInput = (input: string): WebsiteRequirements => {
  const lowerInput = input.toLowerCase();
  
  // Enhanced website type detection with priority for gaming
  let websiteType = 'business';
  let industry = 'general';
  let keyFeatures: string[] = [];
  
  // Gaming detection (highest priority to fix the issue)
  if (lowerInput.includes('game') || lowerInput.includes('gaming') || lowerInput.includes('esport') || lowerInput.includes('tournament') || lowerInput.includes('player') || lowerInput.includes('leaderboard')) {
    websiteType = 'game';
    industry = 'gaming';
    keyFeatures = ['game catalog', 'tournaments', 'leaderboard', 'player profiles', 'community features'];
  } 
  // E-commerce detection
  else if (lowerInput.includes('e-commerce') || lowerInput.includes('shop') || lowerInput.includes('store') || lowerInput.includes('buy') || lowerInput.includes('sell') || lowerInput.includes('product') || lowerInput.includes('cart')) {
    websiteType = 'ecommerce';
    industry = 'retail';
    keyFeatures = ['shopping cart', 'product catalog', 'checkout', 'user accounts'];
  } 
  // Restaurant detection
  else if (lowerInput.includes('restaurant') || lowerInput.includes('food') || lowerInput.includes('dining') || lowerInput.includes('menu') || lowerInput.includes('cafe') || lowerInput.includes('bistro')) {
    websiteType = 'restaurant';
    industry = 'food & beverage';
    keyFeatures = ['menu display', 'reservations', 'location info', 'photo gallery'];
  } 
  // Portfolio detection
  else if (lowerInput.includes('portfolio') || lowerInput.includes('creative') || lowerInput.includes('designer') || lowerInput.includes('developer') || lowerInput.includes('artist') || lowerInput.includes('freelancer')) {
    websiteType = 'portfolio';
    industry = 'creative';
    keyFeatures = ['project showcase', 'image gallery', 'contact form', 'resume'];
  } 
  // Healthcare detection
  else if (lowerInput.includes('healthcare') || lowerInput.includes('medical') || lowerInput.includes('clinic') || lowerInput.includes('doctor') || lowerInput.includes('hospital') || lowerInput.includes('health')) {
    websiteType = 'healthcare';
    industry = 'healthcare';
    keyFeatures = ['appointment booking', 'doctor profiles', 'services', 'patient portal'];
  } 
  // Landing page detection
  else if (lowerInput.includes('landing') || lowerInput.includes('product page') || lowerInput.includes('saas') || lowerInput.includes('startup') || lowerInput.includes('launch')) {
    websiteType = 'landing';
    industry = 'technology';
    keyFeatures = ['hero section', 'features', 'pricing', 'testimonials'];
  }
  
  // Enhanced purpose extraction
  const purposes = ['showcase', 'sell', 'inform', 'book', 'connect', 'display', 'promote'];
  const purpose = purposes.find(p => lowerInput.includes(p)) || 'showcase';
  
  // Enhanced features detection
  const features = [...keyFeatures];
  if (lowerInput.includes('contact')) features.push('contact form');
  if (lowerInput.includes('gallery') || lowerInput.includes('images') || lowerInput.includes('photos')) features.push('image gallery');
  if (lowerInput.includes('blog') || lowerInput.includes('news')) features.push('blog');
  if (lowerInput.includes('search')) features.push('search functionality');
  if (lowerInput.includes('booking') || lowerInput.includes('appointment')) features.push('booking system');
  if (lowerInput.includes('payment') || lowerInput.includes('checkout')) features.push('payment processing');
  
  // Enhanced sections detection based on website type
  const sections = ['hero'];
  if (websiteType === 'game') {
    sections.push('games', 'tournaments', 'leaderboard', 'community');
  } else {
    if (lowerInput.includes('about')) sections.push('about');
    if (lowerInput.includes('service')) sections.push('services');
    if (lowerInput.includes('product')) sections.push('products');
    if (lowerInput.includes('team')) sections.push('team');
    if (lowerInput.includes('contact')) sections.push('contact');
    if (lowerInput.includes('testimonial') || lowerInput.includes('review')) sections.push('testimonials');
    if (lowerInput.includes('pricing')) sections.push('pricing');
    if (lowerInput.includes('gallery')) sections.push('gallery');
    if (lowerInput.includes('blog')) sections.push('blog');
  }
  
  // Enhanced style detection
  let style = 'modern dark theme';
  if (lowerInput.includes('minimal')) style = 'minimal dark theme';
  if (lowerInput.includes('elegant')) style = 'elegant dark theme';
  if (lowerInput.includes('bold')) style = 'bold dark theme';
  if (lowerInput.includes('premium')) style = 'premium dark theme';
  
  // Enhanced audience detection
  let audience = 'general';
  if (websiteType === 'game') {
    audience = 'gamers and esports enthusiasts';
  } else if (lowerInput.includes('business') || lowerInput.includes('corporate')) {
    audience = 'business professionals';
  } else if (lowerInput.includes('young') || lowerInput.includes('millennial')) {
    audience = 'young adults';
  } else if (lowerInput.includes('luxury') || lowerInput.includes('premium')) {
    audience = 'luxury consumers';
  } else if (websiteType === 'ecommerce') {
    audience = 'online shoppers';
  } else if (websiteType === 'healthcare') {
    audience = 'patients and families';
  }
  
  return {
    industry,
    purpose,
    features,
    style,
    audience,
    sections,
    websiteType,
    keyFeatures
  };
};
