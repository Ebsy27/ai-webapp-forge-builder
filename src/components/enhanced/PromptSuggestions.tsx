
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Store, Briefcase, Camera, Stethoscope, Utensils } from 'lucide-react';

interface PromptSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const PromptSuggestions = ({ onSuggestionClick }: PromptSuggestionsProps) => {
  const suggestions = [
    {
      icon: Store,
      title: "E-commerce Store",
      prompt: "Create a modern e-commerce website for a premium sneaker brand with product catalog, shopping cart, user reviews, wishlist, size guides, and secure checkout process. Include dark theme with neon accents.",
      category: "E-commerce"
    },
    {
      icon: Briefcase,
      title: "Business Website",
      prompt: "Build a professional business website for a tech startup with hero section, services showcase, team profiles, client testimonials, pricing plans, and contact forms. Use elegant dark theme with blue accents.",
      category: "Business"
    },
    {
      icon: Camera,
      title: "Photography Portfolio",
      prompt: "Design a stunning photography portfolio with image galleries, filtering by categories, lightbox viewing, about section, client testimonials, and booking contact form. Apply dark theme with gold accents.",
      category: "Creative"
    },
    {
      icon: Stethoscope,
      title: "Healthcare Clinic",
      prompt: "Develop a healthcare clinic website with services overview, doctor profiles, appointment booking system, patient testimonials, insurance information, and emergency contact details. Use clean dark theme with medical blue accents.",
      category: "Healthcare"
    },
    {
      icon: Utensils,
      title: "Restaurant Website",
      prompt: "Create a restaurant website with menu showcase, online reservations, location map, chef profiles, customer reviews, special events, and delivery options. Include warm dark theme with orange accents.",
      category: "Food & Beverage"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800">Suggestion Templates</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-gray-200 bg-gradient-to-br from-gray-50 to-white"
            onClick={() => onSuggestionClick(suggestion.prompt)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <suggestion.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {suggestion.prompt.substring(0, 120)}...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Pro Tips for Better Results:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be specific about your industry and target audience</li>
          <li>• Mention desired sections (about, services, contact, etc.)</li>
          <li>• Include preferred color themes or brand colors</li>
          <li>• Specify any special features (booking, e-commerce, gallery)</li>
          <li>• Mention if you need mobile-first design</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptSuggestions;
