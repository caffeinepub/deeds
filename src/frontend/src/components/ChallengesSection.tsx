import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trophy, Users, Share2, TrendingUp, Award, Medal, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  participants: number;
  trending: boolean;
  weeklyTheme: string;
}

const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'smile-challenge',
    name: 'Smile Challenge',
    description: 'Share a moment that made you smile today and spread joy to others',
    icon: '/assets/generated/smile-challenge-badge-deeds.dim_80x80.png',
    participants: 1247,
    trending: true,
    weeklyTheme: 'Joy & Happiness',
  },
  {
    id: 'gratitude-diaries',
    name: 'Gratitude Diaries',
    description: 'Write about something you\'re grateful for and inspire thankfulness',
    icon: '/assets/generated/gratitude-diaries-badge-deeds.dim_80x80.png',
    participants: 892,
    trending: true,
    weeklyTheme: 'Thankfulness',
  },
  {
    id: 'community-connect',
    name: 'Community Connect',
    description: 'Help someone in your community today and make a difference',
    icon: '/assets/generated/community-connect-badge-deeds.dim_80x80.png',
    participants: 634,
    trending: false,
    weeklyTheme: 'Community Support',
  },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badges: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah K.', points: 2450, badges: 12 },
  { rank: 2, name: 'Michael R.', points: 2180, badges: 10 },
  { rank: 3, name: 'Emma L.', points: 1920, badges: 9 },
  { rank: 4, name: 'David M.', points: 1750, badges: 8 },
  { rank: 5, name: 'Lisa P.', points: 1580, badges: 7 },
];

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
  challengeId: string;
}

const MOCK_USER_BADGES: UserBadge[] = [
  {
    id: 'badge-1',
    name: 'Smile Champion',
    description: 'Completed 5 Smile Challenges',
    icon: '/assets/generated/smile-challenge-badge-deeds.dim_80x80.png',
    earnedDate: '2025-01-20',
    challengeId: 'smile-challenge',
  },
  {
    id: 'badge-2',
    name: 'Gratitude Master',
    description: 'Completed 3 Gratitude Diaries',
    icon: '/assets/generated/gratitude-diaries-badge-deeds.dim_80x80.png',
    earnedDate: '2025-01-18',
    challengeId: 'gratitude-diaries',
  },
];

export default function ChallengesSection() {
  const [participatingChallenges, setParticipatingChallenges] = useState<Set<string>>(new Set());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMyBadges, setShowMyBadges] = useState(false);
  const [showMyProgress, setShowMyProgress] = useState(false);

  const handleJoinChallenge = (challengeId: string, challengeName: string) => {
    setParticipatingChallenges(prev => new Set(prev).add(challengeId));
    toast.success(`🎉 Joined ${challengeName}!`, {
      description: 'Start sharing your positive moments to earn badges!',
    });
  };

  const handleShareChallenge = (challengeName: string) => {
    toast.success(`📤 Challenge Shared!`, {
      description: `"${challengeName}" has been shared with your network!`,
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Weekly Theme Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-xl p-4 border-2 border-primary/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">This Week's Theme</p>
              <p className="text-lg font-bold text-foreground">Spreading Positivity & Kindness</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="gap-2 bg-background/50 hover:bg-background"
          >
            <Trophy className="h-4 w-4" />
            {showLeaderboard ? 'Hide' : 'View'} Leaderboard
          </Button>
        </div>
      </div>

      {/* Leaderboard Section */}
      {showLeaderboard && (
        <Card className="bg-white border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Trophy className="h-6 w-6 text-primary" />
              Weekly Leaderboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Top participants this week - Optional participation, join for fun!
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-102 ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30'
                      : 'bg-muted/50 border border-border'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary/20">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <p className="font-bold text-base">{entry.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {entry.badges} badges
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{entry.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Complete challenges to earn points and climb the leaderboard!
              </p>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                View Full Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenge Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {WEEKLY_CHALLENGES.map((challenge) => {
          const isParticipating = participatingChallenges.has(challenge.id);
          
          return (
            <Card 
              key={challenge.id} 
              className="bg-white backdrop-blur-md shadow-lg border-border/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary/50 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative">
                    <img 
                      src={challenge.icon} 
                      alt={challenge.name}
                      className="h-20 w-20 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    />
                    {isParticipating && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Award className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  {challenge.trending && (
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{challenge.name}</CardTitle>
                <Badge variant="outline" className="w-fit text-xs">
                  {challenge.weeklyTheme}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {challenge.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">
                    {challenge.participants.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">participants</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleJoinChallenge(challenge.id, challenge.name)}
                    disabled={isParticipating}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
                    size="sm"
                  >
                    {isParticipating ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Participating ✓
                      </>
                    ) : (
                      'Join Challenge'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleShareChallenge(challenge.name)}
                    variant="outline"
                    size="sm"
                    className="px-3 hover:bg-accent/50 transition-all duration-300"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {isParticipating && (
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 rounded-xl p-3 text-sm animate-fade-in">
                    <div className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary mb-1">You're participating!</p>
                        <p className="text-muted-foreground text-xs">
                          Share your progress to earn badges and inspire others in the community.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badge Tracking Info */}
      <Card className="bg-white border-2 border-accent/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="py-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-8 w-8 text-primary" />
            <Trophy className="h-8 w-8 text-accent" />
            <Medal className="h-8 w-8 text-secondary" />
          </div>
          <h3 className="text-lg font-bold">Earn Badges & Track Progress</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Complete challenges to earn exclusive badges, climb the leaderboard, and share your achievements with the community. Participation is optional and designed for fun!
          </p>
          <div className="flex gap-3 justify-center flex-wrap mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowMyBadges(true)}
            >
              <Award className="h-4 w-4" />
              My Badges
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowMyProgress(true)}
            >
              <Trophy className="h-4 w-4" />
              My Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Badges Dialog */}
      <Dialog open={showMyBadges} onOpenChange={setShowMyBadges}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Award className="h-6 w-6 text-primary" />
              My Badges
            </DialogTitle>
            <DialogDescription>
              View all the badges you've earned through challenge participation
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 mt-4">
              {MOCK_USER_BADGES.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {MOCK_USER_BADGES.map((badge) => (
                    <Card key={badge.id} className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={badge.icon} 
                            alt={badge.name}
                            className="h-16 w-16 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-base">{badge.name}</h4>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Earned: {new Date(badge.earnedDate).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Join challenges and complete them to earn your first badge!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* My Progress Dialog */}
      <Dialog open={showMyProgress} onOpenChange={setShowMyProgress}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-primary" />
              My Progress
            </DialogTitle>
            <DialogDescription>
              Track your challenge participation and achievements
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 mt-4">
              {/* Overall Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{participatingChallenges.size}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active Challenges</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-accent">{MOCK_USER_BADGES.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Badges Earned</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-secondary">0</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Points</p>
                  </CardContent>
                </Card>
              </div>

              {/* Challenge Progress */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Challenge Progress</h4>
                {participatingChallenges.size > 0 ? (
                  Array.from(participatingChallenges).map((challengeId) => {
                    const challenge = WEEKLY_CHALLENGES.find(c => c.id === challengeId);
                    if (!challenge) return null;
                    
                    return (
                      <Card key={challengeId} className="border-2 border-primary/20 bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img 
                              src={challenge.icon} 
                              alt={challenge.name}
                              className="h-12 w-12 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h5 className="font-bold text-sm">{challenge.name}</h5>
                              <p className="text-xs text-muted-foreground">{challenge.weeklyTheme}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">0 / 5 completed</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                    <div>
                      <h3 className="text-base font-semibold mb-1">No Active Challenges</h3>
                      <p className="text-sm text-muted-foreground">
                        Join a challenge above to start tracking your progress!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
