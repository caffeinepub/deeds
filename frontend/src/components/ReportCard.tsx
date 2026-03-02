import React, { useState } from 'react';
import { useGetProfileReportCard, useUpdateReportCardGradingScale, useUpdateReportCardVisibility, GradingScale } from '../hooks/useQueries';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, Heart, Award } from 'lucide-react';
import { toast } from 'sonner';

function computeGrade(
  postsCount: number,
  deedsCompleted: number,
  likesReceived: number,
  scale: GradingScale
): string {
  const score = Math.min(100, postsCount * 5 + deedsCompleted * 10 + likesReceived * 2);

  if (scale.__kind__ === 'letterGrade') {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  if (scale.__kind__ === 'starRating') {
    if (score >= 80) return '⭐⭐⭐⭐⭐';
    if (score >= 60) return '⭐⭐⭐⭐';
    if (score >= 40) return '⭐⭐⭐';
    if (score >= 20) return '⭐⭐';
    return '⭐';
  }

  // percentage
  return `${score}%`;
}

function getGradeColor(grade: string): string {
  if (grade === 'A' || grade.includes('⭐⭐⭐⭐⭐')) return 'text-green-600';
  if (grade === 'B' || grade.includes('⭐⭐⭐⭐')) return 'text-blue-600';
  if (grade === 'C' || grade.includes('⭐⭐⭐')) return 'text-yellow-600';
  if (grade === 'D' || grade.includes('⭐⭐')) return 'text-orange-600';
  return 'text-red-600';
}

function getWeekRange(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export default function ReportCard() {
  const { data: reportCard, isLoading } = useGetProfileReportCard();
  const updateScale = useUpdateReportCardGradingScale();
  const updateVisibility = useUpdateReportCardVisibility();

  const [localScale, setLocalScale] = useState<GradingScale['__kind__']>('letterGrade');
  const [localPublic, setLocalPublic] = useState(false);

  const currentScale: GradingScale = reportCard
    ? reportCard.gradingScale
    : { __kind__: localScale };

  const isPublic = reportCard ? reportCard.isPublic : localPublic;

  const postsCount = reportCard ? Number(reportCard.postsCount) : 0;
  const deedsCompleted = reportCard ? Number(reportCard.deedsCompleted) : 0;
  const likesReceived = reportCard ? Number(reportCard.likesReceived) : 0;

  const grade = computeGrade(postsCount, deedsCompleted, likesReceived, currentScale);
  const gradeColor = getGradeColor(grade);

  const handleScaleChange = async (scale: GradingScale['__kind__']) => {
    setLocalScale(scale);
    try {
      await updateScale.mutateAsync({ __kind__: scale });
    } catch {
      // silently fail - local state still updates
    }
  };

  const handleVisibilityChange = async (val: boolean) => {
    setLocalPublic(val);
    try {
      await updateVisibility.mutateAsync(val);
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-bold text-foreground text-sm">Weekly Report Card</h3>
            <p className="text-xs text-muted-foreground">{getWeekRange()}</p>
          </div>
        </div>
        <div className={`text-3xl font-black ${gradeColor}`}>{grade}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-primary" />
          </div>
          <div className="text-lg font-bold text-foreground">{postsCount}</div>
          <div className="text-xs text-muted-foreground">Posts</div>
        </div>
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-3 h-3 text-yellow-500" />
          </div>
          <div className="text-lg font-bold text-foreground">{deedsCompleted}</div>
          <div className="text-xs text-muted-foreground">Deeds</div>
        </div>
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Heart className="w-3 h-3 text-red-500" />
          </div>
          <div className="text-lg font-bold text-foreground">{likesReceived}</div>
          <div className="text-xs text-muted-foreground">Likes</div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 space-y-3">
        {/* Grading Scale */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Grading Scale</p>
          <div className="flex gap-2">
            {(['letterGrade', 'starRating', 'percentage'] as GradingScale['__kind__'][]).map((scale) => (
              <button
                key={scale}
                onClick={() => handleScaleChange(scale)}
                className={`flex-1 text-xs py-1.5 px-2 rounded-lg border transition-colors ${
                  currentScale.__kind__ === scale
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50'
                }`}
              >
                {scale === 'letterGrade' ? 'A-F' : scale === 'starRating' ? '⭐ Stars' : '%'}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center justify-between">
          <Label htmlFor="report-public" className="text-xs text-muted-foreground">
            Public Report Card
          </Label>
          <Switch
            id="report-public"
            checked={isPublic}
            onCheckedChange={handleVisibilityChange}
          />
        </div>
      </div>
    </div>
  );
}
