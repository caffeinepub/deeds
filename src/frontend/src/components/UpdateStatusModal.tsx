import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Loader2, Upload, X, Music } from 'lucide-react';
import { useSaveCallerUserProfile, useGetCallerUserProfile, useAttachMusicToStatus, useGetAllMusicAttachments } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

interface UpdateStatusModalProps {
  onClose: () => void;
}

export default function UpdateStatusModal({ onClose }: UpdateStatusModalProps) {
  const { data: profile } = useGetCallerUserProfile();
  const { data: musicLibrary } = useGetAllMusicAttachments();
  const saveProfile = useSaveCallerUserProfile();
  const attachMusic = useAttachMusicToStatus();
  
  const [statusText, setStatusText] = useState(profile?.statusText || '');
  const [statusImage, setStatusImage] = useState<ExternalBlob | null>(
    profile?.statusImage || null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    profile?.statusImage ? profile.statusImage.getDirectURL() : null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });
    setStatusImage(blob);
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Audio file must be less than 10MB');
      return;
    }

    setUploadingMusic(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      const musicId = `music-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      
      await attachMusic.mutateAsync({
        musicId,
        title: fileName,
        artist: 'Unknown Artist',
        audio: blob,
      });

      setSelectedMusicId(musicId);
      toast.success('Music uploaded successfully');
    } catch (error) {
      console.error('Failed to upload music:', error);
      toast.error('Failed to upload music');
    } finally {
      setUploadingMusic(false);
    }
  };

  const handleRemoveImage = () => {
    setStatusImage(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  const handleSave = async () => {
    if (!profile) return;

    if (statusText.length > 500) {
      toast.error('Status text must be 500 characters or less');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        ...profile,
        statusText: statusText.trim() || undefined,
        statusImage: statusImage || undefined,
      });
      toast.success('Status updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[199]" onClick={onClose} />
      <DialogContent className="sm:max-w-[500px] z-[200] bg-white">
        <DialogClose 
          className="absolute right-4 top-4 rounded-full opacity-90 ring-offset-background transition-all hover:opacity-100 hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-[210] cursor-pointer p-2 w-10 h-10 flex items-center justify-center"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Update Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="statusText" className="text-base font-semibold">Status Text</Label>
            <Textarea
              id="statusText"
              placeholder="What's on your mind? (up to 500 characters)"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {statusText.length}/500 characters
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Status Image (optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Status preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute bottom-2 left-2 right-2 bg-background/80 rounded p-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-xs">{uploadProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="statusImageInput"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="statusImageInput"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-muted-foreground">Max 5MB</span>
                </label>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Music className="h-4 w-4" />
              Attach Music (optional)
            </Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                id="musicInput"
                accept="audio/*"
                onChange={handleMusicUpload}
                className="hidden"
                disabled={uploadingMusic}
              />
              <label
                htmlFor="musicInput"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploadingMusic ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Music className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {selectedMusicId ? 'Music attached' : 'Click to upload music'}
                </span>
                <span className="text-xs text-muted-foreground">Max 10MB</span>
              </label>
            </div>
            {musicLibrary && musicLibrary.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Or select from library: {musicLibrary.length} tracks available
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveProfile.isPending || (uploadProgress > 0 && uploadProgress < 100) || uploadingMusic}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

