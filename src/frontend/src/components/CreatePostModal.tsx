import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCreatePost, type PostCategory } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Image, Video, X, Sparkles, Music } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Slider } from './ui/slider';

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [caption, setCaption] = useState('');
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
      
      await createPost.mutateAsync({
        caption: caption.trim(),
        photo: photo || undefined,
        video: video || undefined,
        category: categoryVariant,
      });
      toast.success('Post shared successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post. Please try again.');
    }
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) saturate(${warmth > 50 ? 100 + (warmth - 50) : 100}%)`,
  };

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
            Share a Good Deed
          </DialogTitle>
          <DialogDescription className="text-base">
            Tell the community what's on your mind!
          </DialogDescription>
        </DialogHeader>

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

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.info('Stickers library coming soon! 🎨')}
                    >
                      <img src="/assets/generated/animated-stickers-library-icon-transparent.dim_64x64.png" alt="" className="h-4 w-4 mr-2" />
                      Stickers
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.info('GIFs library coming soon! ✨')}
                    >
                      <img src="/assets/generated/uplifting-gifs-library-icon-transparent.dim_64x64.png" alt="" className="h-4 w-4 mr-2" />
                      GIFs
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="photo" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="photo" className="text-base">
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </TabsTrigger>
                  <TabsTrigger value="video" className="text-base">
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="photo" className="mt-4">
                  <label
                    htmlFor="photo"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:border-primary"
                  >
                    <Image className="h-10 w-10 text-muted-foreground mb-3" />
                    <span className="text-base text-muted-foreground font-medium">
                      Click to upload a photo
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Max 10MB
                    </span>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </TabsContent>
                <TabsContent value="video" className="mt-4">
                  <label
                    htmlFor="video"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/50 transition-all duration-200 hover:border-primary"
                  >
                    <Video className="h-10 w-10 text-muted-foreground mb-3" />
                    <span className="text-base text-muted-foreground font-medium">
                      Click to upload a video
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Max 50MB
                    </span>
                    <input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                </TabsContent>
              </Tabs>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-semibold text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-6"
              disabled={createPost.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPost.isPending || !caption.trim()}
              className="h-11 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {createPost.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Sharing...
                </>
              ) : (
                'Share Post'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

