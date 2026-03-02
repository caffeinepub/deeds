import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, Star, Zap, BookOpen, ShoppingBag, Radio, Globe, Sparkles } from 'lucide-react';

const HUB_SECTIONS = [
  {
    icon: <Heart className="w-6 h-6" />,
    label: 'Love Notes',
    description: 'Send anonymous notes of warmth to strangers',
    path: '/love-notes',
    color: 'from-rose-400 to-pink-500',
    emoji: '💌',
  },
  {
    icon: <Star className="w-6 h-6" />,
    label: 'Deed of the Day',
    description: 'Complete today\'s daily kindness challenge',
    path: '/deed-of-the-day',
    color: 'from-amber-400 to-orange-500',
    emoji: '🌟',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    label: 'Kindness Matches',
    description: 'Discover people who share your passion for good',
    path: '/kindness-matches',
    color: 'from-pink-400 to-rose-500',
    emoji: '💞',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    label: 'Blog',
    description: 'Read and write stories of kindness',
    path: '/blog',
    color: 'from-blue-400 to-indigo-500',
    emoji: '📖',
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    label: 'Marketplace',
    description: 'Share needs and offers with your community',
    path: '/marketplace',
    color: 'from-green-400 to-emerald-500',
    emoji: '🛍️',
  },
  {
    icon: <Radio className="w-6 h-6" />,
    label: 'Live',
    description: 'Stream and watch live acts of kindness',
    path: '/live',
    color: 'from-red-400 to-rose-500',
    emoji: '🔴',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    label: 'Space',
    description: 'Explore the cosmic atmosphere of Deeds',
    path: '/space',
    color: 'from-violet-400 to-purple-500',
    emoji: '🌌',
  },
];

export default function AllInOneHub() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">All-in-One Hub</h1>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Everything Deeds has to offer, all in one place
        </p>
      </div>

      {/* Grid of sections */}
      <div className="grid grid-cols-2 gap-3">
        {HUB_SECTIONS.map((section) => (
          <button
            key={section.path}
            onClick={() => navigate({ to: section.path as any })}
            className="group relative bg-card border border-border rounded-2xl p-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            {/* Gradient background on hover */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-5 transition-opacity`}
            />

            <div className="relative">
              {/* Emoji */}
              <div className="text-3xl mb-2">{section.emoji}</div>

              {/* Label */}
              <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">
                {section.label}
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2">
                {section.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          💖 Every deed matters. Keep spreading kindness!
        </p>
      </div>
    </div>
  );
}
