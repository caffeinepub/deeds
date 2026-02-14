import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetAllPosts,
  useGetFollowers,
  useGetFollowing,
  useGetNotifications,
  useSaveCallerUserProfile,
  useGetUserAlbums,
} from '../hooks/useQueries';
import { useDeedsUsage } from '../hooks/useDeedsUsage';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Loader2, Award, Bell, Edit, Image as ImageIcon, Video, Camera, AlertCircle, MessageSquare, Music } from 'lucide-react';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';
import NotificationsPanel from './NotificationsPanel';
import UpdateStatusModal from './UpdateStatusModal';
import DeedsBar from './DeedsBar';
import GradeDeedsRating from './GradeDeedsRating';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileProps {
  onMessagesClick?: () => void;
}

export default function Profile({ onMessagesClick }: ProfileProps) {
  const { t } = useLanguage();
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: profile, isLoading: profileLoading, error: profileError, isFetched } = useGetCallerUserProfile();
  const { data: allPosts, isLoading: postsLoading } = useGetAllPosts();
  const { data: followers } = useGetFollowers(currentUserPrincipal || null);
  const { data: following } = useGetFollowing(currentUserPrincipal || null);
  const { data: notifications } = useGetNotifications();
  const { data: userAlbums } = useGetUserAlbums(currentUserPrincipal || null);
  const saveProfile = useSaveCallerUserProfile();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const { sessionDuration, dailyUsage } = useDeedsUsage();

  const userPosts = allPosts?.filter(
    (post) => post.author.toString() === currentUserPrincipal?.toString()
  ) || [];

  const photoAlbums = userAlbums?.photoAlbums || [];
  const videoAlbums = userAlbums?.videoAlbums || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedPosts = userPosts ? [...userPosts].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];
  const unreadNotifications = notifications?.filter((n) => !n.read).length || 0;

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture must be less than 5MB');
      return;
    }

    setUploadingProfile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await saveProfile.mutateAsync({
        ...profile,
        profilePicture: blob,
      });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Cover photo must be less than 10MB');
      return;
    }

    setUploadingCover(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      await saveProfile.mutateAsync({
        ...profile,
        layoutPreferences: blob.getDirectURL(),
      });
      toast.success('Cover photo updated successfully');
    } catch (error) {
      console.error('Failed to update cover photo:', error);
      toast.error('Failed to update cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    const rainbowColors = [
      'rgba(255, 215, 0, ',
      'rgba(192, 192, 192, ',
      'rgba(255, 105, 180, ',
      'rgba(138, 43, 226, ',
      'rgba(0, 191, 255, ',
      'rgba(50, 205, 50, ',
      'rgba(255, 69, 0, ',
    ];

    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.3,
        speed: Math.random() * 0.4 + 0.15,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.twinklePhase += particle.twinkleSpeed;
        const twinkle = Math.sin(particle.twinklePhase) * 0.4 + 0.6;
        particle.rotation += particle.rotationSpeed;

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        const spikes = 4;
        const outerRadius = particle.size;
        const innerRadius = particle.size * 0.4;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / spikes) * i;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        ctx.fillStyle = particle.color + (particle.opacity * twinkle) + ')';
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.shadowColor = particle.color + '0.8)';
        ctx.fill();

        ctx.restore();

        particle.y -= particle.speed;
        particle.x += Math.sin(particle.y * 0.01) * 0.3;

        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Profile Error</h2>
        <p className="text-muted-foreground text-center">
          {profileError ? 'Failed to load profile' : 'Profile not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6 shadow-lg">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {profile.layoutPreferences && (
          <img
            src={profile.layoutPreferences}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <label className="absolute bottom-4 right-4 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverPhotoChange}
            className="hidden"
            disabled={uploadingCover}
          />
          <Button size="sm" variant="secondary" disabled={uploadingCover}>
            {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
            {uploadingCover ? 'Uploading...' : 'Edit Cover'}
          </Button>
        </label>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex flex-col items-center md:items-start">
          <div className="relative -mt-16 md:-mt-20">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profilePicture?.getDirectURL()} alt={profile.name} />
              <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                disabled={uploadingProfile}
              />
              <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 shadow-lg" disabled={uploadingProfile}>
                {uploadingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            </label>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.bio || 'No bio yet'}</p>
            </div>
            <div className="flex gap-2 justify-center md:justify-start">
              <Button onClick={() => setShowUpdateStatus(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              <Button onClick={() => setShowNotifications(true)} variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-6 justify-center md:justify-start text-sm">
            <button onClick={() => setShowFollowers(true)} className="hover:text-primary transition-colors">
              <span className="font-bold">{Number(profile.followers)}</span> Followers
            </button>
            <button onClick={() => setShowFollowing(true)} className="hover:text-primary transition-colors">
              <span className="font-bold">{Number(profile.following)}</span> Following
            </button>
            <div>
              <span className="font-bold">{userPosts.length}</span> Posts
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Deeds Bar - Battery Style */}
      <div className="mb-8">
        <DeedsBar
          sessionDuration={sessionDuration}
          dailyUsage={dailyUsage}
          onWarning={() => toast.warning('Session ending soon! Save your work.')}
          onTimeout={() => toast.error('Session timeout reached')}
        />
      </div>

      <Separator className="my-8" />

      {/* Grade Deeds Report Card */}
      <div className="mb-8">
        <GradeDeedsRating
          userPrincipal={currentUserPrincipal?.toString() || ''}
          isFriend={true}
          onRate={(ratings) => {
            console.log('Ratings submitted:', ratings);
          }}
        />
      </div>

      <Separator className="my-8" />

      {/* Albums Section */}
      {(photoAlbums.length > 0 || videoAlbums.length > 0) && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="h-6 w-6 text-primary" />
              Albums
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photoAlbums.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Photo Albums ({photoAlbums.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {photoAlbums.map((album) => (
                        <div key={album.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">{album.name}</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {album.photos.slice(0, 3).map((photo, idx) => (
                              <img
                                key={idx}
                                src={photo.getDirectURL()}
                                alt={`${album.name} ${idx + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {album.photos.length} photo{album.photos.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {videoAlbums.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Video Albums ({videoAlbums.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {videoAlbums.map((album) => (
                        <div key={album.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">{album.name}</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {album.videos.slice(0, 3).map((video, idx) => (
                              <video
                                key={idx}
                                src={video.getDirectURL()}
                                className="w-full h-24 object-cover rounded"
                                controls={false}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {album.videos.length} video{album.videos.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <Separator className="my-8" />
        </>
      )}

      {/* Posts Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">My Posts</h2>
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No posts yet. Share your first deed!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {post.photo && (
                    <img
                      src={post.photo.getDirectURL()}
                      alt="Post"
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {post.video && (
                    <video
                      src={post.video.getDirectURL()}
                      className="w-full h-48 object-cover"
                      controls
                    />
                  )}
                  <div className="p-4">
                    <p className="text-sm line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>{Number(post.likes)} likes</span>
                      <span>{Number(post.comments)} comments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showFollowers && currentUserPrincipal && (
        <FollowersModal
          userPrincipal={currentUserPrincipal}
          onClose={() => setShowFollowers(false)}
        />
      )}
      {showFollowing && currentUserPrincipal && (
        <FollowingModal
          userPrincipal={currentUserPrincipal}
          onClose={() => setShowFollowing(false)}
        />
      )}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
        />
      )}
      {showUpdateStatus && (
        <UpdateStatusModal
          onClose={() => setShowUpdateStatus(false)}
        />
      )}
    </div>
  );
}
