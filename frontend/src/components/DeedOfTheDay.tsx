import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetTodaysChallenge,
  useGetChallengeCompletions,
  useGetUserChallengeCompletions,
  useGetUserProfile,
} from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2, Star, Users, Trophy, Flame } from 'lucide-react';
import { toast } from 'sonner';
import ChallengeCountdown from './ChallengeCountdown';
import CreatePostModal from './CreatePostModal';
import { Principal } from '@icp-sdk/core/principal';
import type { ChallengeCompletion } from '../backend';

function CompletionCard({ completion }: { completion: ChallengeCompletion }) {
  const { data: profile } = useGetUserProfile(completion.user);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-yellow-100 shadow-sm">
      <Avatar className="h-10 w-10 shrink-0">
        {profile?.profilePicture && (
          <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
        )}
        <AvatarFallback className="bg-yellow-100 text-yellow-700 text-sm">
          {profile ? getInitials(profile.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{profile?.name || 'Anonymous'}</p>
        <p className="text-xs text-muted-foreground">{formatTimestamp(completion.timestamp)}</p>
      </div>
      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 shrink-0" />
    </div>
  );
}

export default function DeedOfTheDay() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const { data: challenge, isLoading: challengeLoading } = useGetTodaysChallenge();
  const { data: completions, isLoading: completionsLoading } = useGetChallengeCompletions(challenge?.id ?? null);
  const { data: userCompletions } = useGetUserChallengeCompletions(currentUserPrincipal ?? null);

  const hasCompleted = userCompletions?.some(c => c.challengeId === challenge?.id) ?? false;
  const participantCount = completions?.length ?? 0;

  const getCategoryLabel = (category: any) => {
    const kind = typeof category === 'string' ? category : category?.__kind__;
    switch (kind) {
      case 'environmental': return '🌿 Environmental';
      case 'communityService': return '🤝 Community Service';
      case 'actsOfKindness': return '💛 Acts of Kindness';
      default: return '✨ Other';
    }
  };

  if (!identity) {
    return (
      <div className="container py-16 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold mb-2">Deed of the Day</h2>
        <p className="text-muted-foreground">Please log in to see and complete today's challenge.</p>
      </div>
    );
  }

  if (challengeLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto px-4 space-y-8">
      {/* Hero Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img
          src="/assets/generated/deed-of-the-day-hero.dim_800x400.png"
          alt="Deed of the Day"
          className="w-full h-48 object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Deed of the Day 🌟</h1>
            <p className="text-white/80 text-sm mt-1">A daily challenge to spread kindness together</p>
          </div>
        </div>
      </div>

      {!challenge ? (
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="py-16 text-center space-y-4">
            <div className="text-6xl">🌅</div>
            <div>
              <p className="font-semibold text-amber-700 text-lg">No challenge today yet</p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back soon — today's challenge is being prepared with love! 💛
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Challenge Hero Card */}
          <Card className="border-yellow-300 shadow-lg bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge className="mb-3 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                    {getCategoryLabel(challenge.category)}
                  </Badge>
                  <p className="text-xl font-bold text-amber-900 leading-snug">{challenge.prompt}</p>
                </div>
                <div className="shrink-0 text-4xl">🌟</div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">
                    {participantCount} participant{participantCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-muted-foreground">Resets at midnight</span>
                </div>
              </div>

              {/* Countdown */}
              <div className="bg-white/70 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Time Remaining</p>
                <ChallengeCountdown />
              </div>

              {/* Progress ring (visual) */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-amber-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, participantCount * 5)}%` }}
                  />
                </div>
                <span className="text-xs text-amber-600 font-medium shrink-0">{participantCount} joined</span>
              </div>

              {/* CTA */}
              {hasCompleted ? (
                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <Trophy className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-bold text-green-700">You did it today! 🌟</p>
                    <p className="text-xs text-green-600">Amazing work spreading kindness!</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-base"
                >
                  <Star className="h-5 w-5 mr-2" />
                  Accept & Complete Challenge
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Community Wall */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-amber-700">Community Wall</h2>
              <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {participantCount}
              </span>
            </div>

            {completionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
              </div>
            ) : !completions || completions.length === 0 ? (
              <Card className="border-yellow-100 bg-yellow-50/50">
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <p className="font-semibold text-amber-600">Be the first to complete today's challenge!</p>
                  <p className="text-sm text-muted-foreground mt-1">Your deed could inspire others to join.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...completions]
                  .sort((a, b) => Number(b.timestamp - a.timestamp))
                  .map(completion => (
                    <CompletionCard key={completion.id} completion={completion} />
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {showCompleteModal && challenge && (
        <CreatePostModal
          onClose={() => setShowCompleteModal(false)}
          challengeId={challenge.id}
          challengePrompt={challenge.prompt}
        />
      )}
    </div>
  );
}
