
export interface FileContent {
  code: string;
}

export interface GeneratedCode {
  [filePath: string]: FileContent;
}

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

export interface QualityCheckResult {
  score: number;
  issues: string[];
  suggestions: string[];
  hasAccessibility: boolean;
  hasResponsiveDesign: boolean;
  hasSEO: boolean;
  hasModernCSS: boolean;
}
