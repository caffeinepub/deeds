import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCreateMarketplacePost, type MarketplaceCategory, type Variant_offer_need } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface CreateMarketplacePostModalProps {
  onClose: () => void;
}

export default function CreateMarketplacePostModal({ onClose }: CreateMarketplacePostModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [postType, setPostType] = useState<'need' | 'offer'>('need');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createPost = useCreateMarketplacePost();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !contactMethod.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let mediaBlob: ExternalBlob | undefined = undefined;

      if (media) {
        const arrayBuffer = await media.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      const postTypeVariant: Variant_offer_need = { __kind__: postType };
      const categoryVariant: MarketplaceCategory = { __kind__: category as any };

      await createPost.mutateAsync({
        title: title.trim(),
        category: categoryVariant,
        description: description.trim(),
        location: location.trim(),
        contactMethod: contactMethod.trim(),
        media: mediaBlob,
        postType: postTypeVariant,
      });

      toast.success('Marketplace post created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating marketplace post:', error);
      toast.error('Failed to create marketplace post');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl z-[100]">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <img src="/assets/generated/marketplace-icon-red-transparent.dim_64x64.png" alt="" className="h-8 w-8 flex-shrink-0" />
            <span>Create Marketplace Post</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Share what you need or what you can offer to help the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-3">
            <Label className="text-base font-bold">Post Type *</Label>
            <Tabs value={postType} onValueChange={(v) => setPostType(v as 'need' | 'offer')}>
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="need" className="gap-2 font-bold">
                  <img src="/assets/generated/needs-icon-red-transparent.dim_48x48.png" alt="" className="h-4 w-4" />
                  Need
                </TabsTrigger>
                <TabsTrigger value="offer" className="gap-2 font-bold">
                  <img src="/assets/generated/offers-icon-red-transparent.dim_48x48.png" alt="" className="h-4 w-4" />
                  Offer
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-bold">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your post"
              maxLength={100}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-bold">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="communitySupport">Community Support</SelectItem>
                <SelectItem value="animalWelfare">Animal Welfare</SelectItem>
                <SelectItem value="emotionalSupport">Emotional Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-bold">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need or what you're offering..."
              rows={5}
              maxLength={1000}
              className="rounded-xl resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/1000</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="location" className="text-base font-bold">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Region"
              maxLength={100}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="contact" className="text-base font-bold">Contact Method *</Label>
            <Input
              id="contact"
              value={contactMethod}
              onChange={(e) => setContactMethod(e.target.value)}
              placeholder="Email, phone, or preferred contact method"
              maxLength={100}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold">Media (Optional)</Label>
            {!mediaPreview ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-semibold mb-1">Click to upload media</p>
                  <p className="text-xs text-muted-foreground">Image or video (max 10MB)</p>
                </label>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border">
                {media?.type.startsWith('image/') ? (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-[300px] object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full max-h-[300px]" />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-background/80">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPost.isPending}
              className="flex-1 h-12 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

