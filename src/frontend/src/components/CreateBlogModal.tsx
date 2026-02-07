import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useCreateBlog } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Image, Video, Music, X } from 'lucide-react';
import { Switch } from './ui/switch';

interface CreateBlogModalProps {
  onClose: () => void;
}

export default function CreateBlogModal({ onClose }: CreateBlogModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [media, setMedia] = useState<ExternalBlob[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createBlog = useCreateBlog();

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMedia: ExternalBlob[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 50MB`);
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      newMedia.push(blob);
      newPreviews.push(URL.createObjectURL(file));
    }

    setMedia([...media, ...newMedia]);
    setPreviewUrls([...previewUrls, ...newPreviews]);
    setUploadProgress(0);
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please enter a title and content');
      return;
    }

    try {
      const categoryArray = categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createBlog.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        media,
        categories: categoryArray,
        tags: tagArray,
        isLive,
      });
      toast.success(isLive ? 'Live blog created!' : 'Blog published successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog. Please try again.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Blog</DialogTitle>
          <DialogDescription>
            Share your story with text, photos, videos, and audio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your blog a catchy title..."
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content..."
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">{content.length} characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories (comma-separated)</Label>
            <Input
              id="categories"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="e.g., Environmental, Community, Kindness"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., inspiration, change, impact"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="live" checked={isLive} onCheckedChange={setIsLive} />
            <Label htmlFor="live">Enable live blogging (update in real-time)</Label>
          </div>

          <div className="space-y-2">
            <Label>Media (photos, videos, audio)</Label>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {previewUrls.map((url, idx) => {
                  const isVideo = url.includes('video') || media[idx]?.getDirectURL().match(/\.(mp4|mov|avi|webm)$/i);
                  const isAudio = url.includes('audio') || media[idx]?.getDirectURL().match(/\.(mp3|wav|ogg)$/i);

                  return (
                    <div key={idx} className="relative">
                      {isVideo ? (
                        <video src={url} className="w-full h-24 object-cover rounded-lg border" />
                      ) : isAudio ? (
                        <div className="w-full h-24 flex items-center justify-center bg-accent rounded-lg border">
                          <Music className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <img src={url} alt="Preview" className="w-full h-24 object-cover rounded-lg border" />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveMedia(idx)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <label
              htmlFor="media"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Image className="h-6 w-6 text-muted-foreground" />
                <Video className="h-6 w-6 text-muted-foreground" />
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground mt-2">
                Click to upload media files
              </span>
              <input
                id="media"
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <p className="text-sm text-muted-foreground">Uploading: {uploadProgress}%</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBlog.isPending || !title.trim() || !content.trim()}>
              {createBlog.isPending ? 'Publishing...' : isLive ? 'Start Live Blog' : 'Publish Blog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
