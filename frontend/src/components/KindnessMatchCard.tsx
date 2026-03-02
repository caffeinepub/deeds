import React from 'react';
import { useGetUserProfile, type KindnessMatch } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface KindnessMatchCardProps {
  match: KindnessMatch;
  index: number;
}

export default function KindnessMatchCard({ match, index }: KindnessMatchCardProps) {
  const withUserPrincipal = match.withUser?.toString() ?? null;
  const { data: profile } = useGetUserProfile(withUserPrincipal);
  const navigate = useNavigate();

  const getAvatarUrl = () => {
    if (profile?.profilePicture && profile.profilePicture.__kind__ === 'Some') {
      try {
        const blob = profile.profilePicture.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return undefined;
  };

  const getCategoryLabel = (category: any) => {
    const kind = typeof category === 'string' ? category : category?.__kind__;
    switch (kind) {
      case 'environmental': return '🌿 Environmental';
      case 'communityService': return '🤝 Community';
      case 'actsOfKindness': return '💛 Kindness';
      default: return '✨ Other';
    }
  };

  const score = Number(match.compatibilityScore);

  const handleSayHello = () => {
    navigate({ to: '/messages' });
  };

  return (
    <div
      className="rounded-2xl border border-pink-200 bg-gradient-to-br from-white to-pink-50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-14 w-14 ring-2 ring-pink-200">
            <AvatarImage src={getAvatarUrl()} alt={profile?.name} />
            <AvatarFallback className="bg-pink-100 text-pink-700 text-lg font-bold">
              {profile?.name?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {index + 1}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{profile?.name ?? 'Kind Soul'}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{profile?.bio ?? 'A fellow deed-doer'}</p>
        </div>
        <Heart className="h-5 w-5 text-pink-400 fill-pink-200 shrink-0" />
      </div>

      {/* Compatibility Score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">Compatibility</span>
          <span className="text-sm font-bold text-pink-700">{score}%</span>
        </div>
        <div className="bg-pink-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      </div>

      {/* Shared Categories */}
      {match.sharedCategories && match.sharedCategories.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider">Shared Passions</p>
          <div className="flex flex-wrap gap-1.5">
            {match.sharedCategories.map((cat, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-pink-100 text-pink-700 border-pink-200">
                {getCategoryLabel(cat)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Match Reason */}
      {match.reason && (
        <p className="text-sm text-gray-600 italic bg-pink-50/80 rounded-lg p-3 border border-pink-100">
          "{match.reason}"
        </p>
      )}

      {/* Say Hello Button */}
      <Button
        onClick={handleSayHello}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Say Hello 👋
      </Button>
    </div>
  );
}
