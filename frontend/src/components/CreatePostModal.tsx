import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost, PostCategory } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Image, Video, Sparkles, X } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Curated pool of deed categories
const CATEGORY_POOL = [
  { label: 'Kindness', value: { __kind__: 'actsOfKindness' } as PostCategory },
  { label: 'Community', value: { __kind__: 'communityService' } as PostCategory },
  { label: 'Environment', value: { __kind__: 'environmental' } as PostCategory },
  { label: 'Family', value: { __kind__: 'other' } as PostCategory },
  { label: 'Health', value: { __kind__: 'other' } as PostCategory },
  { label: 'Creativity', value: { __kind__: 'other' } as PostCategory },
  { label: 'Education', value: { __kind__: 'communityService' } as PostCategory },
  { label: 'Support', value: { __kind__: 'actsOfKindness' } as PostCategory },
  { label: 'Compassion', value: { __kind__: 'actsOfKindness' } as PostCategory },
  { label: 'Service', value: { __kind__: 'communityService' } as PostCategory },
  { label: 'Growth', value: { __kind__: 'other' } as PostCategory },
  { label: 'Connection', value: { __kind__: 'other' } as PostCategory },
];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const VISUAL_FILTERS = [
  { label: 'None', filter: '' },
  { label: 'Warm', filter: 'sepia(0.4) saturate(1.3)' },
  { label: 'Cool', filter: 'hue-rotate(30deg) saturate(1.2)' },
  { label: 'Bright', filter: 'brightness(1.2) contrast(1.1)' },
  { label: 'Vintage', filter: 'sepia(0.6) contrast(0.9)' },
];

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<{ label: string; value: PostCategory } | null>(null);
  const [displayedCategories, setDisplayedCategories] = useState<typeof CATEGORY_POOL>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  // Randomize categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const count = 4 + Math.floor(Math.random() * 3); // 4-6 categories
      setDisplayedCategories(shuffleArray(CATEGORY_POOL).slice(0, count));
      setSelectedCategory(null);
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      toast.error('Please add a caption');
      return;
    }
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      let photoBlob: ExternalBlob | undefined = undefined;
      let videoBlob: ExternalBlob | undefined = undefined;

      if (photoFile) {
        const bytes = new Uint8Array(await photoFile.arrayBuffer());
        photoBlob = ExternalBlob.fromBytes(bytes);
      }

      if (videoFile) {
        const bytes = new Uint8Array(await videoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes);
      }

      await createPost.mutateAsync({
        caption: caption.trim(),
        category: selectedCategory.value,
        photo: photoBlob,
        video: videoBlob,
      });

      toast.success('Deed shared! 🌟');
      setCaption('');
      setSelectedCategory(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setVideoFile(null);
      setVideoPreview(null);
      setSelectedFilter(0);
      onClose();
    } catch {
      toast.error('Failed to share deed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCaption('');
      setSelectedCategory(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setVideoFile(null);
      setVideoPreview(null);
      setSelectedFilter(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Share a Deed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Caption */}
          <Textarea
            placeholder="What good deed did you do today? Share your story..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">{caption.length}/500</div>

          {/* Category Selection */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Choose a Category <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {displayedCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedCategory?.label === cat.label
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {!selectedCategory && (
              <p className="text-xs text-muted-foreground mt-1">Select a category for your deed</p>
            )}
          </div>

          {/* Media Upload */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
              className="flex-1 text-xs"
            >
              <Image className="w-3 h-3 mr-1" />
              Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              className="flex-1 text-xs"
            >
              <Video className="w-3 h-3 mr-1" />
              Video
            </Button>
            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
          </div>

          {/* Photo Preview */}
          {photoPreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full max-h-48 object-cover"
                style={{ filter: VISUAL_FILTERS[selectedFilter].filter }}
              />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Filters */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-2 flex gap-2 overflow-x-auto">
                {VISUAL_FILTERS.map((f, i) => (
                  <button
                    key={f.label}
                    onClick={() => setSelectedFilter(i)}
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap transition-colors ${
                      selectedFilter === i ? 'bg-white text-black' : 'bg-white/30 text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <div className="relative rounded-xl overflow-hidden">
              <video src={videoPreview} className="w-full max-h-48 object-cover" controls />
              <button
                onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !caption.trim() || !selectedCategory}
            className="w-full"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Sharing...
              </span>
            ) : (
              'Share Deed 🌟'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
