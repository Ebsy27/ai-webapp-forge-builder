
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';

interface FeedbackSystemProps {
  onFeedbackSubmit: (feedback: FeedbackData) => void;
  hasGeneratedCode: boolean;
}

interface FeedbackData {
  rating: number;
  liked: boolean | null;
  comments: string;
  categories: string[];
  timestamp: Date;
}

const FeedbackSystem = ({ onFeedbackSubmit, hasGeneratedCode }: FeedbackSystemProps) => {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Design Quality',
    'Code Quality',
    'Responsiveness',
    'Functionality',
    'User Experience',
    'Performance',
    'Accessibility',
    'SEO Optimization'
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = () => {
    const feedbackData: FeedbackData = {
      rating,
      liked,
      comments,
      categories: selectedCategories,
      timestamp: new Date()
    };
    
    onFeedbackSubmit(feedbackData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setLiked(null);
      setComments('');
      setSelectedCategories([]);
    }, 3000);
  };

  if (!hasGeneratedCode) {
    return null;
  }

  if (submitted) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h3>
          <p className="text-green-600">Your feedback helps us improve our AI website generator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center space-x-2 text-gray-800">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span>Rate Your Generated Website</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`w-8 h-8 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                <Star className="w-full h-full fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Like/Dislike */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Would you recommend this tool?
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setLiked(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                liked === true 
                  ? 'bg-green-100 border-green-300 text-green-800' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => setLiked(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                liked === false 
                  ? 'bg-red-100 border-red-300 text-red-800' 
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What impressed you most? (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments (Optional)
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share your thoughts on the generated website..."
            className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedbackSystem;
