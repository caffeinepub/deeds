import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCreatePost, useCompleteDailyChallenge, type PostCategory } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Image, Video, X, Sparkles, Music, Zap, Star } from 'lucide-react';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';

interface CreatePostModalProps {
  onClose: () => void;
  parentPostId?: string;
  parentCaption?: string;
  parentAuthorName?: string;
  challengeId?: string;
  challengePrompt?: string;
}

export default function CreatePostModal({ 
  onClose, 
  parentPostId, 
  parentCaption, 
  parentAuthorName,
  challengeId,
  challengePrompt,
}: CreatePostModalProps) {
  const [caption, setCaption] = useState(challengePrompt ? `✅ Challenge: ${challengePrompt}\n\n` : '');
  const [category, setCategory] = useState<string>('actsOfKindness');
  const [photo, setPhoto] = useState<ExternalBlob | null>(null);
  const [video, setVideo] = useState<ExternalBlob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [warmth, setWarmth] = useState(50);
  const [brightness, setBrightness] = useState(50);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const createPost = useCreatePost();
  const completeDailyChallenge = useCompleteDailyChallenge();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });

    setPhoto(blob);
    setVideo(null);
    setMediaType('photo');
    setPreviewUrl(URL.createObjectURL(file));
    setUploadProgress(0);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });

    setVideo(blob);
    setPhoto(null);
    setMediaType('video');
    setPreviewUrl(URL.createObjectURL(file));
    setUploadProgress(0);
  };

  const handleRemoveMedia = () => {
    setPhoto(null);
    setVideo(null);
    setMediaType(null);
    setPreviewUrl(null);
    setWarmth(50);
    setBrightness(50);
    setSelectedMusic(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caption.trim()) {
      toast.error('Please enter a caption');
      return;
    }

    try {
      const categoryVariant: PostCategory = { __kind__: category as any };
      
      const newPost = await createPost.mutateAsync({
        caption: caption.trim(),
        parentPostId: parentPostId,
        photo: photo || undefined,
        video: video || undefined,
        category: categoryVariant,
      });

      // If this is a challenge completion, register it
      if (challengeId && newPost && 'id' in newPost) {
        try {
          await completeDailyChallenge.mutateAsync({
            challengeId,
            postId: (newPost as any).id,
          });
        } catch (err) {
          // Non-fatal: post was created, challenge completion may have failed
          console.error('Challenge completion error:', err);
        }
      }

      if (parentPostId) {
        toast.success('Your inspired deed has been shared! ✨');
      } else if (challengeId) {
        toast.success('Challenge completed! 🌟 You did it!');
      } else {
        toast.success('Post shared successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post. Please try again.');
    }
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) saturate(${warmth > 50 ? 100 + (warmth - 50) : 100}%)`,
  };

  const isSubmitting = createPost.isPending || completeDailyChallenge.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" onClick={onClose} />
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto z-[200]">
        <DialogClose 
          className="absolute right-4 top-4 rounded-full opacity-90 ring-offset-background transition-all hover:opacity-100 hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-[210] cursor-pointer p-2 w-10 h-10 flex items-center justify-center"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {challengeId ? '🌟 Complete Today\'s Challenge' : parentPostId ? '✨ Share Your Inspired Deed' : 'Share a Good Deed'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {challengeId ? 'Tell the community how you completed today\'s challenge!' : parentPostId ? 'Tell the community what this deed inspired you to do!' : 'Tell the community what\'s on your mind!'}
          </DialogDescription>
        </DialogHeader>

        {/* Inspired by banner */}
        {parentPostId && parentCaption && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <Zap className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-700 mb-1">Inspired by {parentAuthorName || 'someone'}</p>
              <p className="text-sm text-amber-800 line-clamp-2">{parentCaption}</p>
            </div>
          </div>
        )}

        {/* Challenge banner */}
        {challengeId && challengePrompt && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <Star className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-yellow-700 mb-1">Today's Challenge</p>
              <p className="text-sm text-yellow-800">{challengePrompt}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="caption" className="text-base font-semibold">
              What's happening? *
            </Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={500}
              rows={5}
              required
              className="resize-none text-base"
            />
            <p className="text-sm text-muted-foreground">
              {caption.length}/500 characters
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-semibold">
              Category *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environmental">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/generated/category-environmental-transparent.dim_64x64.png"
                      alt=""
                      className="h-6 w-6"
                    />
                    <span className="text-base">Environmental</span>
                  </div>
                </SelectItem>
                <SelectItem value="communityService">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/generated/category-community-transparent.dim_64x64.png"
                      alt=""
                      className="h-6 w-6"
                    />
                    <span className="text-base">Community Service</span>
                  </div>
                </SelectItem>
                <SelectItem value="actsOfKindness">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/generated/category-kindness-transparent.dim_64x64.png"
                      alt=""
                      className="h-6 w-6"
                    />
                    <span className="text-base">Acts of Kindness</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <span className="text-base">Other</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Visual Storytelling Tools
            </Label>
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-2 border-border">
                  {mediaType === 'photo' ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                      style={filterStyle}
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-64 object-cover"
                      style={filterStyle}
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3 shadow-lg z-10"
                    onClick={handleRemoveMedia}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4 bg-muted/50 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <img src="/assets/generated/warmth-filter-icon-transparent.dim_48x48.png" alt="" className="h-4 w-4" />
                        Warmth
                      </Label>
                      <span className="text-sm text-muted-foreground">{warmth}%</span>
                    </div>
                    <Slider
                      value={[warmth]}
                      onValueChange={(value) => setWarmth(value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <img src="/assets/generated/brightness-filter-icon-transparent.dim_48x48.png" alt="" className="h-4 w-4" />
                        Brightness
                      </Label>
                      <span className="text-sm text-muted-foreground">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={(value) => setBrightness(value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {mediaType === 'video' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        Background Music
                      </Label>
                      <Select value={selectedMusic || ''} onValueChange={setSelectedMusic}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose uplifting music..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uplifting-1">Uplifting Journey</SelectItem>
                          <SelectItem value="happy-vibes">Happy Vibes</SelectItem>
                          <SelectItem value="positive-energy">Positive Energy</SelectItem>
                          <SelectItem value="inspiring-moments">Inspiring Moments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <Image className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Add Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoChange}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !caption.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Sharing...
                </>
              ) : challengeId ? (
                '🌟 Complete Challenge'
              ) : parentPostId ? (
                '✨ Share Inspired Deed'
              ) : (
                'Share Deed'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
