
export interface FileContent {
  code: string;
}

export interface FileStructure {
  [filePath: string]: FileContent;
}

export interface GeneratedCode {
  [filePath: string]: FileContent;
}

export interface WebsiteRequirements {
  industry?: string;
  purpose?: string;
  features?: string[];
  style?: string;
  audience?: string;
  sections?: string[];
  colors?: string;
  branding?: string;
  websiteType?: string;
  keyFeatures?: string[];
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
