import React, { useState } from 'react';
import { MessageCircle, Tag, Clock, ThumbsUp } from 'lucide-react';

interface Request {
  id: string;
  author: {
    name: string;
    avatar: string;
    startup: string;
  };
  title: string;
  content: string;
  tags: string[];
  replies: number;
  upvotes: number;
  timestamp: string;
  isUpvoted?: boolean;
}

interface RequestCardProps {
  request: Request;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
  const [isUpvoted, setIsUpvoted] = useState(request.isUpvoted || false);
  const [upvotesCount, setUpvotesCount] = useState(request.upvotes);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
    setUpvotesCount(prev => isUpvoted ? prev - 1 : prev + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={request.author.avatar}
            alt={request.author.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{request.author.name}</h4>
            <p className="text-sm text-gray-600">{request.author.startup}</p>
          </div>
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {request.timestamp}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-3">{request.title}</h3>
      <p className="text-gray-700 mb-4 leading-relaxed">{request.content}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {request.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
              isUpvoted 
                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{upvotesCount}</span>
          </button>

          <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{request.replies} replies</span>
          </button>
        </div>

        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          Reply
        </button>
      </div>
    </div>
  );
};