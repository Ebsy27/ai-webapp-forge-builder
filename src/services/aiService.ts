
import { FileStructure, WebsiteRequirements, GeneratedCode } from "../types";
import { ENHANCED_SYSTEM_PROMPT, generateEnhancedPrompt } from "./enhanced/promptTemplates";

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Export the GeneratedCode type for use in other files
export type { GeneratedCode };

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Remove hardcoded models - let backend handle model selection
const getAvailableModel = async (apiKey: string): Promise<string> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    
    const data = await response.json();
    const availableModels = data.data || [];
    
    // Priority order for model selection - use first available
    const preferredModels = [
      'llama-3.3-70b-versatile',
      'llama-3.2-90b-text-preview', 
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ];
    
    for (const preferred of preferredModels) {
      const model = availableModels.find((m: any) => m.id === preferred);
      if (model) {
        console.log(`Using model: ${preferred}`);
        return preferred;
      }
    }
    
    // Fallback to first available model
    if (availableModels.length > 0) {
      const fallbackModel = availableModels[0].id;
      console.log(`Using fallback model: ${fallbackModel}`);
      return fallbackModel;
    }
    
    throw new Error('No available models found');
  } catch (error) {
    console.error('Error fetching models:', error);
    // Ultimate fallback - try a basic model that should exist
    return 'llama-3.1-8b-instant';
  }
};

export const generateWebsite = async (
  prompt: string,
  apiKey?: string,
  requirements?: WebsiteRequirements
): Promise<GeneratedCode> => {
  // Use environment variable or default if no API key provided
  const effectiveApiKey = apiKey || import.meta.env.VITE_GROQ_API_KEY;
  
  if (!effectiveApiKey?.trim()) {
    throw new Error('API key is required. Please set VITE_GROQ_API_KEY environment variable or provide an API key.');
  }

  try {
    // Get available model dynamically
    const modelToUse = await getAvailableModel(effectiveApiKey);
    
    const enhancedPrompt = generateEnhancedPrompt(prompt, requirements);
    
    console.log('Sending request to Groq API...');
    console.log('Using model:', modelToUse);
    console.log('Prompt length:', enhancedPrompt.length);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${effectiveApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
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
        temperature: 0.7,
        max_tokens: 8000,
        top_p: 0.9,
        stream: false
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      
      let errorMessage = `API request failed with status ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // Use the raw error text if it's not JSON
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response received');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid response structure from API');
    }

    const content = data.choices[0].message.content.trim();
    console.log('Raw AI response length:', content.length);
    console.log('Raw AI response preview:', content.substring(0, 500));

    // Enhanced JSON cleaning and parsing
    const cleanedContent = cleanAndParseJSON(content);
    
    if (!cleanedContent || typeof cleanedContent !== 'object') {
      throw new Error('Failed to parse valid JSON from AI response');
    }

    // Validate the structure
    const files = validateAndCleanFiles(cleanedContent);
    
    return files;

  } catch (error) {
    console.error('Enhanced website generation error:', error);
    
    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes('model_decommissioned')) {
        throw new Error('The selected AI model is no longer available. Please try again - the system will automatically select an available model.');
      }
      if (error.message.includes('invalid_request_error')) {
        throw new Error('Invalid API request. Please check your API key and try again.');
      }
      if (error.message.includes('rate_limit')) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      }
    }
    
    throw error;
  }
};

// Enhanced JSON cleaning function
const cleanAndParseJSON = (content: string): any => {
  try {
    // Remove any text before the first { and after the last }
    const startIndex = content.indexOf('{');
    const lastIndex = content.lastIndexOf('}');
    
    if (startIndex === -1 || lastIndex === -1) {
      throw new Error('No valid JSON structure found');
    }
    
    let jsonStr = content.substring(startIndex, lastIndex + 1);
    
    // Clean up common JSON formatting issues
    jsonStr = jsonStr
      // Fix escaped quotes in strings
      .replace(/\\"/g, '"')
      // Fix double escaped quotes
      .replace(/\\\\"/g, '\\"')
      // Remove any trailing commas before closing braces
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix newlines in strings
      .replace(/\\n/g, '\\n')
      // Fix tabs in strings
      .replace(/\\t/g, '\\t')
      // Remove any markdown code block indicators
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      // Fix any double-encoded JSON
      .replace(/"{/g, '{')
      .replace(/}"/g, '}')
      // Clean up extra whitespace
      .trim();

    console.log('Cleaned JSON preview:', jsonStr.substring(0, 500));
    
    // Try to parse the cleaned JSON
    const parsed = JSON.parse(jsonStr);
    
    // Validate that it has the expected structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Parsed JSON is not an object');
    }
    
    return parsed;
    
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Content that failed to parse:', content.substring(0, 1000));
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const validateAndCleanFiles = (json: any): FileStructure => {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON format: Root must be an object');
  }

  const files: FileStructure = {};

  for (const filePath in json) {
    if (Object.hasOwnProperty.call(json, filePath)) {
      const fileData = json[filePath];

      if (!fileData || typeof fileData !== 'object' || !fileData.hasOwnProperty('code')) {
        console.warn(`Skipping file ${filePath}: Missing 'code' property or invalid format`);
        continue;
      }

      let code = fileData.code;

      if (typeof code !== 'string') {
        console.warn(`Skipping file ${filePath}: 'code' is not a string`);
        continue;
      }

      code = code.trim();

      if (!code) {
        console.warn(`Skipping file ${filePath}: Empty code`);
        continue;
      }

      files[filePath] = { code };
    }
  }

  if (Object.keys(files).length === 0) {
    throw new Error('No valid files found in JSON');
  }

  return files;
};
