
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

CRITICAL REQUIREMENTS:
- Generate COMPLETE, FUNCTIONAL React applications
- Use ONLY valid JSON format - NO template literals, NO backticks, NO markdown
- All code must be properly escaped JSON strings
- Every website MUST have a modern, elegant DARK THEME
- Implement sophisticated glassmorphism, gradients, and premium typography
- Add smooth animations, hover effects, and micro-interactions
- Ensure 100% responsive design and accessibility compliance

MANDATORY TECHNICAL SPECIFICATIONS:
- React 18 with functional components and hooks
- Modern CSS with flexbox/grid layouts
- Semantic HTML5 structure
- Professional color schemes with dark backgrounds
- Premium fonts (Inter, Poppins) with perfect typography hierarchy
- Smooth scrolling navigation and interactive elements
- Mobile-first responsive design
- Performance optimization and SEO best practices

DESIGN REQUIREMENTS:
- Dark theme with sophisticated color palettes (#0a0a0a, #1a1a2e backgrounds)
- Gradient accents and glassmorphism effects
- Modern shadows, borders, and visual depth
- Professional spacing and visual hierarchy
- Consistent branding and visual identity
- Accessible contrast ratios and keyboard navigation

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON object with exact structure below
- NO explanations, NO markdown, NO comments outside JSON
- All code must be properly escaped JSON strings
- Ensure all quotes are properly escaped
- No backticks or template literals allowed

REQUIRED JSON STRUCTURE:
{
  "/src/App.js": { "code": "// Complete React component code here" },
  "/src/index.js": { "code": "// React DOM render code here" },
  "/src/App.css": { "code": "/* Complete CSS with dark theme */" },
  "/public/index.html": { "code": "<!-- HTML template -->" },
  "/package.json": { "code": "// Package configuration" }
}`;

export const generateEnhancedPrompt = (userInput: string, requirements?: WebsiteRequirements): string => {
  const analysisPrompt = `
CREATE A MODERN WEBSITE: "${userInput}"

DETAILED SPECIFICATIONS:
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

MANDATORY IMPLEMENTATION REQUIREMENTS:

1. DARK THEME PRIORITY:
   - Use sophisticated dark backgrounds (#0a0a0a, #1a1a2e, #16213e)
   - Implement gradient overlays and glassmorphism effects
   - Add strategic accent colors (vibrant blues, teals, or purples)
   - Ensure proper contrast ratios for accessibility

2. PREMIUM DESIGN ELEMENTS:
   - Modern typography with Inter/Poppins fonts
   - Smooth animations and hover effects
   - Glassmorphism cards with backdrop-filter
   - Gradient buttons and interactive elements
   - Professional shadows and depth effects

3. RESPONSIVE EXCELLENCE:
   - Mobile-first CSS Grid and Flexbox layouts
   - Smooth transitions between breakpoints
   - Optimized touch interactions
   - Consistent spacing across all devices

4. FUNCTIONAL COMPLETENESS:
   - Working navigation with smooth scrolling
   - Interactive buttons and form elements
   - Dynamic content and state management
   - Professional loading states and transitions

5. PRODUCTION READINESS:
   - Clean, semantic HTML structure
   - Optimized CSS with custom properties
   - Accessible markup with proper ARIA labels
   - SEO-friendly meta tags and structure

WEBSITE TYPE SPECIFIC FEATURES:
${getTypeSpecificRequirements(userInput)}

CRITICAL JSON OUTPUT RULES:
- Return ONLY the JSON object with the required structure
- Use double quotes for all JSON keys and values
- Properly escape all quotes within code strings
- NO template literals (backticks) allowed
- NO markdown code blocks or explanations
- Ensure all JavaScript/CSS code is valid and functional

Generate a completely unique, production-ready website that exceeds modern web standards.`;

  return analysisPrompt;
};

function getTypeSpecificRequirements(userInput: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('e-commerce') || input.includes('shop') || input.includes('store') || input.includes('sneaker')) {
    return `
E-COMMERCE REQUIREMENTS:
- Product showcase with image placeholders and hover effects
- Shopping cart functionality with add/remove items
- Product categories and filtering options
- Professional product cards with pricing
- Smooth animations for product interactions
- Mobile-optimized shopping experience
- Secure-looking checkout process
- Customer testimonials and reviews section`;
  }
  
  if (input.includes('portfolio') || input.includes('creative') || input.includes('photography')) {
    return `
PORTFOLIO REQUIREMENTS:
- Image gallery with lightbox effects
- Project showcase with hover animations
- Skills section with progress indicators
- Professional about section
- Contact form with validation
- Smooth scrolling between sections
- Creative animations and transitions
- Responsive image galleries`;
  }
  
  if (input.includes('restaurant') || input.includes('food') || input.includes('dining')) {
    return `
RESTAURANT REQUIREMENTS:
- Menu showcase with categories and pricing
- Hero section with food imagery
- Location and hours information
- Reservation system interface
- Chef profiles and restaurant story
- Customer reviews section
- Mobile-friendly menu browsing
- Social media integration`;
  }
  
  if (input.includes('healthcare') || input.includes('medical') || input.includes('clinic')) {
    return `
HEALTHCARE REQUIREMENTS:
- Services overview with medical icons
- Doctor profiles with specializations
- Appointment booking interface
- Patient testimonials
- Insurance information
- Emergency contact details
- Professional medical design
- Accessibility compliance`;
  }
  
  return `
BUSINESS REQUIREMENTS:
- Professional hero section with compelling CTAs
- Services showcase with detailed descriptions
- Team member profiles
- Client testimonials and case studies
- Contact forms and business information
- Professional branding and typography
- Trust-building elements
- Lead generation optimization`;
}

export const analyzeUserInput = (input: string): WebsiteRequirements => {
  const lowerInput = input.toLowerCase();
  
  // Enhanced industry detection
  let industry = 'general';
  if (lowerInput.includes('e-commerce') || lowerInput.includes('shop') || lowerInput.includes('store') || lowerInput.includes('sneaker')) {
    industry = 'e-commerce';
  } else if (lowerInput.includes('restaurant') || lowerInput.includes('food')) {
    industry = 'restaurant';
  } else if (lowerInput.includes('healthcare') || lowerInput.includes('medical')) {
    industry = 'healthcare';
  } else if (lowerInput.includes('portfolio') || lowerInput.includes('creative')) {
    industry = 'creative';
  } else if (lowerInput.includes('business') || lowerInput.includes('corporate')) {
    industry = 'business';
  }
  
  // Enhanced purpose extraction
  const purposes = ['showcase', 'sell', 'inform', 'book', 'connect', 'display'];
  const purpose = purposes.find(p => lowerInput.includes(p)) || 'showcase';
  
  // Enhanced features detection
  const features = [];
  if (lowerInput.includes('cart') || lowerInput.includes('shopping')) features.push('shopping cart');
  if (lowerInput.includes('booking') || lowerInput.includes('appointment')) features.push('appointment booking');
  if (lowerInput.includes('gallery') || lowerInput.includes('images')) features.push('image gallery');
  if (lowerInput.includes('review') || lowerInput.includes('testimonial')) features.push('customer reviews');
  if (lowerInput.includes('contact') || lowerInput.includes('form')) features.push('contact form');
  if (lowerInput.includes('search') || lowerInput.includes('filter')) features.push('search and filter');
  if (lowerInput.includes('animation') || lowerInput.includes('interactive')) features.push('animations');
  
  // Enhanced sections detection
  const sections = ['hero'];
  if (lowerInput.includes('about')) sections.push('about');
  if (lowerInput.includes('service')) sections.push('services');
  if (lowerInput.includes('product')) sections.push('products');
  if (lowerInput.includes('team')) sections.push('team');
  if (lowerInput.includes('contact')) sections.push('contact');
  if (lowerInput.includes('testimonial')) sections.push('testimonials');
  if (lowerInput.includes('pricing')) sections.push('pricing');
  if (lowerInput.includes('gallery')) sections.push('gallery');
  
  // Enhanced style detection
  let style = 'modern dark theme';
  if (lowerInput.includes('minimal')) style = 'minimal dark theme';
  if (lowerInput.includes('elegant')) style = 'elegant dark theme';
  if (lowerInput.includes('bold')) style = 'bold dark theme';
  if (lowerInput.includes('premium')) style = 'premium dark theme';
  
  // Enhanced audience detection
  let audience = 'general';
  if (lowerInput.includes('business') || lowerInput.includes('corporate')) {
    audience = 'business professionals';
  } else if (lowerInput.includes('young') || lowerInput.includes('millennial')) {
    audience = 'young adults';
  } else if (lowerInput.includes('luxury') || lowerInput.includes('premium')) {
    audience = 'luxury consumers';
  } else if (lowerInput.includes('sneaker') || lowerInput.includes('fashion')) {
    audience = 'fashion enthusiasts';
  }
  
  return {
    industry,
    purpose,
    features,
    style,
    audience,
    sections
  };
};
