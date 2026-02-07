import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Star, TrendingUp, MessageCircle, Palette, Heart, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface GradeDeedsRatingProps {
  userPrincipal: string;
  isFriend: boolean;
  onRate?: (ratings: RatingSubmission) => void;
}

interface RatingSubmission {
  responsiveness: number;
  authenticity: number;
  activityLevel: number;
  profileCreativity: number;
  positivity: number;
}

interface RatingData {
  responsiveness: number;
  authenticity: number;
  activityLevel: number;
  profileCreativity: number;
  positivity: number;
  totalRatings: number;
  systemGenerated: {
    timeOnDeeds: number;
    challengesParticipation: number;
  };
}

// Mock data - in production this would come from backend
const mockRatingData: RatingData = {
  responsiveness: 8.5,
  authenticity: 9.2,
  activityLevel: 7.8,
  profileCreativity: 8.9,
  positivity: 9.5,
  totalRatings: 24,
  systemGenerated: {
    timeOnDeeds: 8.2,
    challengesParticipation: 7.5,
  },
};

export default function GradeDeedsRating({ userPrincipal, isFriend, onRate }: GradeDeedsRatingProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratings, setRatings] = useState<RatingSubmission>({
    responsiveness: 5,
    authenticity: 5,
    activityLevel: 5,
    profileCreativity: 5,
    positivity: 5,
  });

  const ratingData = mockRatingData;

  const handleSubmitRating = () => {
    if (!isFriend) {
      toast.error('You can only rate your friends');
      return;
    }

    onRate?.(ratings);
    toast.success('Rating submitted successfully!');
    setShowRatingModal(false);
  };

  const getRatingColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Grade Deeds Report Card
            </CardTitle>
            {isFriend && (
              <Button
                onClick={() => setShowRatingModal(true)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Star className="h-4 w-4 mr-2" />
                Rate Friend
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {ratingData.totalRatings} friend ratings
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Core Metrics
            </h3>

            {/* Responsiveness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Responsiveness</Label>
                </div>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.responsiveness)}`}>
                  {ratingData.responsiveness.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.responsiveness * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{getRatingLabel(ratingData.responsiveness)}</p>
            </div>

            {/* Authenticity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Authenticity</Label>
                </div>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.authenticity)}`}>
                  {ratingData.authenticity.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.authenticity * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{getRatingLabel(ratingData.authenticity)}</p>
            </div>

            {/* Activity Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Activity Level</Label>
                </div>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.activityLevel)}`}>
                  {ratingData.activityLevel.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.activityLevel * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{getRatingLabel(ratingData.activityLevel)}</p>
            </div>

            {/* Profile Creativity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Profile Creativity</Label>
                </div>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.profileCreativity)}`}>
                  {ratingData.profileCreativity.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.profileCreativity * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{getRatingLabel(ratingData.profileCreativity)}</p>
            </div>

            {/* Positivity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Positivity</Label>
                </div>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.positivity)}`}>
                  {ratingData.positivity.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.positivity * 10} className="h-2" />
              <p className="text-xs text-muted-foreground">{getRatingLabel(ratingData.positivity)}</p>
            </div>
          </div>

          {/* System Generated Metrics */}
          <div className="pt-4 border-t border-border/50 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Platform Engagement
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-sm">Time on Deeds</Label>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.systemGenerated.timeOnDeeds)}`}>
                  {ratingData.systemGenerated.timeOnDeeds.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.systemGenerated.timeOnDeeds * 10} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-sm">Challenges Participation</Label>
                <span className={`text-lg font-bold ${getRatingColor(ratingData.systemGenerated.challengesParticipation)}`}>
                  {ratingData.systemGenerated.challengesParticipation.toFixed(1)}/10
                </span>
              </div>
              <Progress value={ratingData.systemGenerated.challengesParticipation * 10} className="h-2" />
            </div>
          </div>

          {/* Overall Grade */}
          <div className="pt-4 border-t border-border/50">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Overall Grade</p>
              <p className="text-5xl font-bold text-primary">
                {((ratingData.responsiveness + ratingData.authenticity + ratingData.activityLevel + 
                   ratingData.profileCreativity + ratingData.positivity) / 5).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">out of 10</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Rate Your Friend
            </DialogTitle>
            <DialogDescription>
              Rate your friend on a scale of 1-10 for each category. Your ratings help build their Grade Deeds Report Card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Responsiveness */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Responsiveness
                </Label>
                <span className="text-2xl font-bold text-primary">{ratings.responsiveness}</span>
              </div>
              <Slider
                value={[ratings.responsiveness]}
                onValueChange={(value) => setRatings({ ...ratings, responsiveness: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How quickly do they respond to messages?</p>
            </div>

            {/* Authenticity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Authenticity
                </Label>
                <span className="text-2xl font-bold text-primary">{ratings.authenticity}</span>
              </div>
              <Slider
                value={[ratings.authenticity]}
                onValueChange={(value) => setRatings({ ...ratings, authenticity: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How genuine and authentic are they?</p>
            </div>

            {/* Activity Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Activity Level
                </Label>
                <span className="text-2xl font-bold text-primary">{ratings.activityLevel}</span>
              </div>
              <Slider
                value={[ratings.activityLevel]}
                onValueChange={(value) => setRatings({ ...ratings, activityLevel: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How active are they on Deeds?</p>
            </div>

            {/* Profile Creativity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Profile Creativity
                </Label>
                <span className="text-2xl font-bold text-primary">{ratings.profileCreativity}</span>
              </div>
              <Slider
                value={[ratings.profileCreativity]}
                onValueChange={(value) => setRatings({ ...ratings, profileCreativity: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How creative is their profile?</p>
            </div>

            {/* Positivity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Positivity
                </Label>
                <span className="text-2xl font-bold text-primary">{ratings.positivity}</span>
              </div>
              <Slider
                value={[ratings.positivity]}
                onValueChange={(value) => setRatings({ ...ratings, positivity: value[0] })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">How positive and uplifting are they?</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRating} className="bg-primary hover:bg-primary/90">
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
