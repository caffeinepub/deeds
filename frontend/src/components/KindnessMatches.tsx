import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetKindnessMatches } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Heart, Sparkles } from 'lucide-react';
import KindnessMatchCard from './KindnessMatchCard';

export default function KindnessMatches() {
  const { identity } = useInternetIdentity();
  const { data: matches, isLoading } = useGetKindnessMatches();

  if (!identity) {
    return (
      <div className="container py-16 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">💞</div>
        <h2 className="text-2xl font-bold mb-2">Kindness Matches</h2>
        <p className="text-muted-foreground">Please log in to discover your kindness matches.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto px-4 space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src="/assets/generated/kindness-match-hero.dim_800x400.png"
          alt="Kindness Matches"
          className="w-full h-48 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 to-transparent flex items-end p-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Kindness Matches 💞</h1>
            <p className="text-white/80 text-sm mt-1">People who share your passion for doing good</p>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          These are people whose deeds align with yours. You share the same heart — why not say hello? 💕
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-pink-400 mx-auto" />
            <p className="text-muted-foreground text-sm">Finding your kindness matches...</p>
          </div>
        </div>
      ) : !matches || matches.length === 0 ? (
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="py-16 text-center space-y-4">
            <div className="text-6xl">🌱</div>
            <div>
              <p className="font-bold text-pink-700 text-xl">No matches yet</p>
              <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                Post more deeds to help us find people who share your kindness! The more you share, the better your matches. 💕
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Sparkles className="h-5 w-5 text-pink-400" />
              <span className="text-sm text-pink-500 font-medium">Keep doing good deeds!</span>
              <Sparkles className="h-5 w-5 text-pink-400" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-200" />
            <h2 className="text-xl font-bold text-pink-700">Your Top Matches</h2>
            <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {matches.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matches.map((match, index) => (
              <KindnessMatchCard key={index} match={match} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
