import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ExternalBlob } from '../backend';
import { Camera } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ open, onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const { identity } = useInternetIdentity();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identity) return;

    let profilePictureBlob: ExternalBlob | undefined = undefined;

    if (profilePicture) {
      const arrayBuffer = await profilePicture.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      profilePictureBlob = ExternalBlob.fromBytes(uint8Array);
    }

    saveProfile(
      {
        principal: identity.getPrincipal(),
        name: name.trim(),
        bio: bio.trim(),
        profilePicture: profilePictureBlob,
        followers: BigInt(0),
        following: BigInt(0),
        statusText: undefined,
        statusImage: undefined,
        layoutPreferences: undefined,
      },
      {
        onSuccess: () => {
          onComplete();
        },
      }
    );
  };

  return (
    <>
      {/* Enhanced modal blocking backdrop with proper z-index */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[199] animate-fade-in"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md bg-white z-[200] shadow-2xl border-2 border-border/50 animate-fade-in" 
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/assets/generated/updated-deeds-logo-white-glow-d-star-effect.dim_400x120.png" 
                alt="Deeds" 
                className="h-20 w-auto"
              />
            </div>
            <DialogTitle className="text-2xl text-center bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent font-bold">
              Welcome to Deeds!
            </DialogTitle>
            <DialogDescription className="text-center text-base px-4">
              Let's set up your profile to get started
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="profilePicture" className="text-sm font-semibold">
                Profile Picture (Optional)
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-red-500 shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-400/20 flex items-center justify-center border-2 border-red-500/30">
                      <Camera className="h-8 w-8 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer file:cursor-pointer transition-all hover:border-red-500/50"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                maxLength={50}
                className="h-11 transition-all focus:border-red-500 focus:ring-red-500"
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">
                Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={200}
                className="resize-none transition-all focus:border-red-500 focus:ring-red-500"
                disabled={isPending}
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating Profile...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
