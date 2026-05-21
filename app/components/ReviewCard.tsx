"use client";
import React from 'react';
import { Star, MessageSquare, CheckCircle, Sparkles } from 'lucide-react';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string;
  publish_time: string;
  status: 'Pending' | 'Resolved';
  selected_reply?: string;
}

interface ReviewCardProps {
  review: Review;
  onGenerateAI: (review: Review) => void;
  isGenerating: boolean;
}

export default function ReviewCard({ review, onGenerateAI, isGenerating }: ReviewCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-slate-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-slate-800 text-lg">{review.author_name}</h4>
          <span className="text-xs text-slate-400">{review.publish_time}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
          review.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          {review.status === 'Resolved' ? <CheckCircle size={14} /> : <MessageSquare size={14} />}
          {review.status}
        </span>
      </div>

      <div className="flex mb-3 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
        ))}
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-5">{review.review_text}</p>

      {review.selected_reply && (
        <div className="mb-5 bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Phản hồi đã duyệt</p>
          <p className="text-slate-600 text-sm italic">"{review.selected_reply}"</p>
        </div>
      )}

      {review.status === 'Pending' && (
        <button
          onClick={() => onGenerateAI(review)}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50"
        >
          <Sparkles size={16} />
          {isGenerating ? 'AI đang viết phản hồi...' : 'Generate AI Replies'}
        </button>
      )}
    </div>
  );
}
