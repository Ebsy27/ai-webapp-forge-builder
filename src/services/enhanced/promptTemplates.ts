
export interface WebsiteRequirements {
  industry: string;
  purpose: string;
  features: string[];
  style: string;
  audience: string;
  sections: string[];
  colors?: string;
  branding?: string;
}

export const ENHANCED_SYSTEM_PROMPT = `You are an elite AI web developer specializing in creating production-ready, modern websites with exceptional design and functionality.

CRITICAL DESIGN REQUIREMENTS:
- ALWAYS use a modern, elegant DARK THEME as the primary design
- Apply sophisticated color schemes with carefully chosen accent colors
- Use premium typography (Inter, Poppins, Montserrat) with perfect hierarchy
- Implement glassmorphism, subtle gradients, and modern shadows
- Add smooth hover effects, micro-interactions, and tasteful animations
- Ensure pixel-perfect spacing, alignment, and visual balance

TECHNICAL EXCELLENCE:
- Generate clean, semantic HTML5 with proper structure
- Use modern CSS techniques: CSS Grid, Flexbox, CSS Custom Properties
- Implement responsive design with mobile-first approach
- Ensure accessibility (WCAG 2.1 AA compliance)
- Add SEO optimization with proper meta tags and semantic markup
- Include security best practices for forms and data handling

MANDATORY FEATURES FOR ALL SITES:
- Sticky navigation with smooth scrolling
- Professional hero section with compelling CTAs
- Fully responsive layout (desktop, tablet, mobile)
- Loading states and smooth transitions
- Accessibility features (keyboard navigation, screen reader support)
- Performance optimizations (lazy loading, optimized images)

WEBSITE STRUCTURE REQUIREMENTS:
- Modern React components with TypeScript
- Proper state management and hooks usage
- Clean component architecture with reusable elements
- Optimized CSS with utility classes and custom properties
- Professional color palette with dark theme priority

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "/src/App.js": { "code": "// Complete React application code" },
  "/src/index.js": { "code": "// React entry point" },
  "/src/App.css": { "code": "/* Modern CSS with dark theme */" },
  "/public/index.html": { "code": "<!-- HTML template -->" },
  "/package.json": { "code": "// Package configuration" }
}

NO markdown formatting, NO explanations, NO code blocks - ONLY the JSON object.`;

export const generateEnhancedPrompt = (userInput: string, requirements?: WebsiteRequirements): string => {
  const analysisPrompt = `
WEBSITE GENERATION REQUEST: "${userInput}"

ANALYSIS & REQUIREMENTS:
${requirements ? `
- Industry: ${requirements.industry}
- Purpose: ${requirements.purpose}
- Target Audience: ${requirements.audience}
- Key Features: ${requirements.features.join(', ')}
- Required Sections: ${requirements.sections.join(', ')}
- Style Preferences: ${requirements.style}
${requirements.colors ? `- Color Preferences: ${requirements.colors}` : ''}
${requirements.branding ? `- Branding Notes: ${requirements.branding}` : ''}
` : ''}

SPECIFIC IMPLEMENTATION REQUIREMENTS:
1. DARK THEME PRIORITY: Use sophisticated dark backgrounds (#0f0f0f, #1a1a1a, #2d2d2d) with strategic accent colors
2. PREMIUM TYPOGRAPHY: Implement Inter/Poppins with perfect font weights and spacing
3. ADVANCED FEATURES: Include all requested functionality with modern UX patterns
4. RESPONSIVE EXCELLENCE: Ensure flawless experience across all devices
5. PERFORMANCE OPTIMIZATION: Implement lazy loading, smooth animations, and efficient rendering
6. ACCESSIBILITY COMPLIANCE: Full keyboard navigation, proper ARIA labels, contrast ratios
7. SEO OPTIMIZATION: Semantic HTML, meta tags, structured data where applicable

WEBSITE TYPE SPECIFIC REQUIREMENTS:
${getTypeSpecificRequirements(userInput)}

Generate a completely unique, production-ready website that exceeds modern web standards.
Return ONLY the JSON structure with complete, functional code.`;

  return analysisPrompt;
};

function getTypeSpecificRequirements(userInput: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('e-commerce') || input.includes('shop') || input.includes('store')) {
    return `
E-COMMERCE SPECIFIC:
- Product catalog with advanced filtering and search
- Shopping cart with persistent state
- Wishlist functionality
- Product image galleries with zoom
- Customer reviews and ratings
- Secure checkout process simulation
- Inventory status indicators
- Related products suggestions`;
  }
  
  if (input.includes('portfolio') || input.includes('creative') || input.includes('photography')) {
    return `
PORTFOLIO SPECIFIC:
- Image galleries with lightbox functionality
- Category-based filtering system
- Smooth parallax scrolling effects
- Project case studies with detailed views
- Client testimonials carousel
- Contact form with project inquiry fields
- Social media integration
- Download portfolio/resume functionality`;
  }
  
  if (input.includes('restaurant') || input.includes('food') || input.includes('dining')) {
    return `
RESTAURANT SPECIFIC:
- Interactive menu with categories and pricing
- Online reservation system
- Location map with directions
- Chef and staff profiles
- Customer reviews and ratings
- Special events and promotions
- Delivery/takeout options
- Nutritional information and allergen details`;
  }
  
  if (input.includes('healthcare') || input.includes('medical') || input.includes('clinic')) {
    return `
HEALTHCARE SPECIFIC:
- Services overview with detailed descriptions
- Doctor profiles with specializations
- Appointment booking system
- Patient testimonials
- Insurance information
- Emergency contact information
- Health resources and education
- HIPAA compliance considerations`;
  }
  
  return `
BUSINESS SPECIFIC:
- Professional hero section with value proposition
- Services/products showcase
- Team member profiles
- Client testimonials and case studies
- Pricing plans comparison
- Contact forms with business inquiry fields
- Company history and mission
- Blog/news section for content marketing`;
}

export const analyzeUserInput = (input: string): WebsiteRequirements => {
  const lowerInput = input.toLowerCase();
  
  // Industry detection
  let industry = 'general';
  if (lowerInput.includes('e-commerce') || lowerInput.includes('shop') || lowerInput.includes('store')) industry = 'e-commerce';
  else if (lowerInput.includes('restaurant') || lowerInput.includes('food')) industry = 'restaurant';
  else if (lowerInput.includes('healthcare') || lowerInput.includes('medical')) industry = 'healthcare';
  else if (lowerInput.includes('portfolio') || lowerInput.includes('creative')) industry = 'creative';
  else if (lowerInput.includes('business') || lowerInput.includes('corporate')) industry = 'business';
  
  // Purpose extraction
  const purposes = ['showcase', 'sell', 'inform', 'book', 'connect', 'display'];
  const purpose = purposes.find(p => lowerInput.includes(p)) || 'showcase';
  
  // Features detection
  const features = [];
  if (lowerInput.includes('cart') || lowerInput.includes('shopping')) features.push('shopping cart');
  if (lowerInput.includes('booking') || lowerInput.includes('appointment')) features.push('appointment booking');
  if (lowerInput.includes('gallery') || lowerInput.includes('images')) features.push('image gallery');
  if (lowerInput.includes('review') || lowerInput.includes('testimonial')) features.push('customer reviews');
  if (lowerInput.includes('contact') || lowerInput.includes('form')) features.push('contact form');
  if (lowerInput.includes('search') || lowerInput.includes('filter')) features.push('search and filter');
  
  // Sections detection
  const sections = ['hero'];
  if (lowerInput.includes('about')) sections.push('about');
  if (lowerInput.includes('service')) sections.push('services');
  if (lowerInput.includes('product')) sections.push('products');
  if (lowerInput.includes('team')) sections.push('team');
  if (lowerInput.includes('contact')) sections.push('contact');
  if (lowerInput.includes('testimonial')) sections.push('testimonials');
  if (lowerInput.includes('pricing')) sections.push('pricing');
  
  // Style detection
  let style = 'modern';
  if (lowerInput.includes('minimal')) style = 'minimal';
  if (lowerInput.includes('elegant')) style = 'elegant';
  if (lowerInput.includes('bold')) style = 'bold';
  if (lowerInput.includes('premium')) style = 'premium';
  
  // Audience detection
  let audience = 'general';
  if (lowerInput.includes('business') || lowerInput.includes('corporate')) audience = 'business professionals';
  else if (lowerInput.includes('young') || lowerInput.includes('millennial')) audience = 'young adults';
  else if (lowerInput.includes('luxury') || lowerInput.includes('premium')) audience = 'luxury consumers';
  
  return {
    industry,
    purpose,
    features,
    style,
    audience,
    sections
  };
};
