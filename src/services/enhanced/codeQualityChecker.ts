
import { GeneratedCode } from '../types';

export interface QualityCheckResult {
  score: number;
  issues: string[];
  suggestions: string[];
  hasAccessibility: boolean;
  hasResponsiveDesign: boolean;
  hasSEO: boolean;
  hasModernCSS: boolean;
}

export const checkCodeQuality = (code: GeneratedCode): QualityCheckResult => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Get the main files
  const appCode = code['/src/App.js']?.code || '';
  const cssCode = code['/src/App.css']?.code || '';
  const htmlCode = code['/public/index.html']?.code || '';

  // Check for accessibility features
  const hasAccessibility = checkAccessibility(appCode, cssCode);
  if (!hasAccessibility) {
    issues.push('Missing accessibility features');
    suggestions.push('Add ARIA labels, keyboard navigation, and proper semantic markup');
    score -= 15;
  }

  // Check for responsive design
  const hasResponsiveDesign = checkResponsiveDesign(cssCode);
  if (!hasResponsiveDesign) {
    issues.push('Missing responsive design');
    suggestions.push('Add media queries and flexible layouts');
    score -= 20;
  }

  // Check for SEO optimization
  const hasSEO = checkSEO(htmlCode, appCode);
  if (!hasSEO) {
    issues.push('Missing SEO optimization');
    suggestions.push('Add meta tags, semantic HTML, and structured data');
    score -= 10;
  }

  // Check for modern CSS practices
  const hasModernCSS = checkModernCSS(cssCode);
  if (!hasModernCSS) {
    issues.push('Not using modern CSS practices');
    suggestions.push('Use CSS Grid, Flexbox, and CSS Custom Properties');
    score -= 15;
  }

  // Check for dark theme implementation
  if (!cssCode.includes('dark') && !cssCode.includes('#0f0f0f') && !cssCode.includes('#1a1a1a')) {
    issues.push('Dark theme not properly implemented');
    suggestions.push('Implement proper dark theme with modern color palette');
    score -= 20;
  }

  // Check for modern animations
  if (!cssCode.includes('transition') && !cssCode.includes('animation')) {
    issues.push('Missing modern animations and transitions');
    suggestions.push('Add smooth hover effects and micro-interactions');
    score -= 10;
  }

  // Check for proper React patterns
  if (!appCode.includes('useState') && !appCode.includes('useEffect')) {
    issues.push('Not using modern React patterns');
    suggestions.push('Use React hooks for state management');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    hasAccessibility,
    hasResponsiveDesign,
    hasSEO,
    hasModernCSS
  };
};

const checkAccessibility = (appCode: string, cssCode: string): boolean => {
  const accessibilityFeatures = [
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'role=',
    'alt=',
    'tabIndex',
    'focus:',
    'screen reader'
  ];

  return accessibilityFeatures.some(feature => 
    appCode.includes(feature) || cssCode.includes(feature)
  );
};

const checkResponsiveDesign = (cssCode: string): boolean => {
  const responsiveFeatures = [
    '@media',
    'grid-template-columns',
    'flex-wrap',
    'min-width',
    'max-width',
    'responsive',
    'mobile'
  ];

  return responsiveFeatures.some(feature => cssCode.includes(feature));
};

const checkSEO = (htmlCode: string, appCode: string): boolean => {
  const seoFeatures = [
    '<meta name="description"',
    '<meta name="keywords"',
    '<meta property="og:',
    '<title>',
    'semantic',
    '<header>',
    '<main>',
    '<section>'
  ];

  return seoFeatures.some(feature => 
    htmlCode.includes(feature) || appCode.includes(feature)
  );
};

const checkModernCSS = (cssCode: string): boolean => {
  const modernFeatures = [
    'display: grid',
    'display: flex',
    'var(--',
    'clamp(',
    'min(',
    'max(',
    'backdrop-filter',
    'transform',
    'transition'
  ];

  return modernFeatures.some(feature => cssCode.includes(feature));
};

export const enhanceCodeQuality = (code: GeneratedCode): GeneratedCode => {
  const enhanced = { ...code };
  
  // Enhance CSS with modern features
  if (enhanced['/src/App.css']) {
    let css = enhanced['/src/App.css'].code;
    
    // Add CSS custom properties if missing
    if (!css.includes(':root')) {
      css = `:root {
  --primary-bg: #0f0f0f;
  --secondary-bg: #1a1a1a;
  --accent-bg: #2d2d2d;
  --primary-text: #ffffff;
  --secondary-text: #b0b0b0;
  --accent-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}

${css}`;
    }
    
    // Enhance with modern animations if missing
    if (!css.includes('transition')) {
      css += `
/* Modern Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Smooth Transitions */
* {
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}`;
    }
    
    enhanced['/src/App.css'] = { code: css };
  }
  
  return enhanced;
};
