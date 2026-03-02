import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile, useGetCallerUserProfile, useCreateStatusUpdate } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Image, Music, X } from 'lucide-react';

interface UpdateStatusModalProps {
  onClose: () => void;
}

export default function UpdateStatusModal({ onClose }: UpdateStatusModalProps) {
  const { data: profile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const createStatusUpdate = useCreateStatusUpdate();

  const existingStatusText =
    profile?.statusText && profile.statusText.__kind__ === 'Some'
      ? profile.statusText.value
      : '';

  const [statusText, setStatusText] = useState<string>(existingStatusText);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioName(file.name);
  };

  const handleSubmit = async () => {
    if (statusText.length > 500) {
      toast.error('Status text is too long (max 500 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageBlob: ExternalBlob | undefined = undefined;
      let musicData: any = undefined;

      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      }

      if (audioFile) {
        const bytes = new Uint8Array(await audioFile.arrayBuffer());
        const audioBlob = ExternalBlob.fromBytes(bytes);
        musicData = {
          title: audioName ?? 'Untitled',
          artist: profile?.name ?? 'Unknown',
          audioFile: audioBlob,
        };
      }

      // Create status update
      await createStatusUpdate.mutateAsync({
        text: statusText.trim() || undefined,
        image: imageBlob,
        music: musicData,
      });

      // Also update profile status text
      if (profile) {
        await saveProfile.mutateAsync({
          ...profile,
          name: profile.name,
          statusText: statusText.trim() || undefined,
        } as any);
      }

      toast.success('Status updated!');
      onClose();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="status-text">What's on your mind?</Label>
            <Textarea
              id="status-text"
              placeholder="Share how you're feeling or what you're up to..."
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              className="resize-none"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground text-right">{statusText.length}/500 characters</p>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden">
              <img src={imagePreview} alt="Status" className="w-full max-h-32 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Audio indicator */}
          {audioName && (
            <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
              <Music className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground truncate flex-1">{audioName}</span>
              <button
                onClick={() => { setAudioFile(null); setAudioName(null); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Media buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              className="flex-1 text-xs"
              disabled={isSubmitting}
            >
              <Image className="w-3 h-3 mr-1" />
              Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => audioInputRef.current?.click()}
              className="flex-1 text-xs"
              disabled={isSubmitting}
            >
              <Music className="w-3 h-3 mr-1" />
              Music
            </Button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
