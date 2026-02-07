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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Loader2, Award, Bell, Edit, Image as ImageIcon, Video, Camera, AlertCircle, MessageSquare, Music } from 'lucide-react';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';
import NotificationsPanel from './NotificationsPanel';
import UpdateStatusModal from './UpdateStatusModal';
import AnimatedDeedsBar from './AnimatedDeedsBar';
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
  
  const [sessionStart] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [dailyUsage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Date.now() - sessionStart);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

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
        particle.x += Math.sin(particle.twinklePhase * 0.5) * 0.3;
        
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [profile]);

  if (profileError) {
    return (
      <div className="relative min-h-screen bg-white">
        <div className="container py-8 pb-24 max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-2 border-destructive/20">
            <CardContent className="py-16 text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <h3 className="text-2xl font-bold text-destructive">Error Loading Profile</h3>
              <p className="text-muted-foreground">
                There was an error loading your profile. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="relative min-h-screen bg-white">
        <div className="container py-8 pb-24 max-w-4xl mx-auto px-4">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile && isFetched) {
    return (
      <div className="relative min-h-screen bg-white">
        <div className="container py-8 pb-24 max-w-4xl mx-auto px-4">
          <Card className="shadow-lg border-2 border-destructive/20">
            <CardContent className="py-16 text-center space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
              <p className="text-muted-foreground text-lg">{t('profile.notFound')}</p>
              <p className="text-sm text-muted-foreground">
                Please try logging out and logging back in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="relative container py-8 pb-24 max-w-4xl mx-auto px-4">
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <AnimatedDeedsBar
              sessionDuration={sessionDuration}
              dailyUsage={dailyUsage}
              onWarning={() => toast.warning('⚠️ 1 minute until auto-logout')}
              onTimeout={() => toast.error('Session timeout - please log in again')}
            />
          </div>
        </div>

        <Card className="mb-8 bg-white shadow-xl border-border/50 rounded-2xl overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
            {profile?.layoutPreferences ? (
              <img
                src={profile.layoutPreferences}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
            )}
            <label
              htmlFor="coverPhotoInput"
              className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 p-2 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110 border-2 border-white z-10"
            >
              {uploadingCover ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Camera className="h-5 w-5 text-primary" />
              )}
              <input
                id="coverPhotoInput"
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoChange}
                className="hidden"
                disabled={uploadingCover}
              />
            </label>
          </div>

          <CardHeader className="pb-4 pt-8 -mt-16 relative z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-4 w-full">
                <CardTitle className="text-3xl text-center text-foreground font-extrabold break-words px-4">
                  {profile?.name}
                </CardTitle>

                <div className="relative flex-shrink-0">
                  <Avatar className="h-32 w-32 ring-4 ring-white shadow-2xl">
                    {profile?.profilePicture && (
                      <AvatarImage
                        src={profile.profilePicture.getDirectURL()}
                        alt={profile.name}
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl font-bold">
                      {getInitials(profile?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profilePictureInput"
                    className="absolute bottom-0 right-0 bg-white hover:bg-gray-50 p-2 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110 border-2 border-white z-10"
                  >
                    {uploadingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Camera className="h-4 w-4 text-primary" />
                    )}
                    <input
                      id="profilePictureInput"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      disabled={uploadingProfile}
                    />
                  </label>
                </div>

                <div className="flex flex-col items-center gap-3 w-full px-4">
                  {profile?.bio && (
                    <p className="text-base text-muted-foreground leading-relaxed break-words text-center max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-6 text-sm pt-1 flex-wrap justify-center">
                    <button
                      onClick={() => setShowFollowers(true)}
                      className="hover:underline text-foreground font-medium transition-colors hover:text-primary"
                    >
                      <span className="font-bold text-lg">{Number(profile?.followers || 0)}</span>{' '}
                      <span className="text-muted-foreground">{t('profile.followers')}</span>
                    </button>
                    <button
                      onClick={() => setShowFollowing(true)}
                      className="hover:underline text-foreground font-medium transition-colors hover:text-primary"
                    >
                      <span className="font-bold text-lg">{Number(profile?.following || 0)}</span>{' '}
                      <span className="text-muted-foreground">{t('profile.following')}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {onMessagesClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onMessagesClick}
                    className="rounded-xl shadow-sm hover:shadow-md transition-all flex-shrink-0"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative rounded-xl shadow-sm hover:shadow-md transition-all flex-shrink-0"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-md">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
              <Award className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="font-bold text-lg text-foreground">
                {sortedPosts.length} {sortedPosts.length === 1 ? 'Deed' : t('profile.deeds')}{' '}
                Shared
              </span>
            </div>

            <Separator className="my-6 bg-border/50" />
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  {t('profile.status')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateStatus(true)}
                  className="h-10 gap-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all px-4"
                >
                  <Edit className="h-4 w-4" />
                  <span className="font-semibold">{t('profile.updateStatus')}</span>
                </Button>
              </div>
              <div className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 border-2 border-transparent bg-clip-padding overflow-hidden shadow-lg"
                style={{
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFD700 0%, #C0C0C0 25%, #FF69B4 50%, #8A2BE2 75%, #00BFFF 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box',
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 0 }}
                />
                
                <div className="relative" style={{ zIndex: 1 }}>
                  {profile?.statusText || profile?.statusImage ? (
                    <div className="space-y-4">
                      {profile.statusText && (
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
                          {profile.statusText}
                        </p>
                      )}
                      {profile.statusImage && (
                        <img
                          src={profile.statusImage.getDirectURL()}
                          alt="Status"
                          className="w-full max-h-80 object-cover rounded-xl border-2 border-white/50 dark:border-gray-700/50 shadow-lg"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-base text-gray-600 dark:text-gray-400 italic text-center py-4">
                      ✨ No status set. Click "Update Status" to share what's on your mind! ✨
                    </p>
                  )}
                </div>
              </div>
            </div>

            {(photoAlbums.length > 0 || videoAlbums.length > 0) && (
              <>
                <Separator className="my-8 bg-border/50" />
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <ImageIcon className="h-7 w-7 text-primary" />
                    Album Section
                  </h3>
                  
                  {photoAlbums.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <h4 className="text-lg font-semibold">Photo Albums</h4>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {photoAlbums.length}
                        </span>
                      </div>
                      {photoAlbums.map((album) => (
                        <div key={album.id} className="space-y-3">
                          <h5 className="text-md font-semibold text-foreground">{album.name}</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {album.photos.map((photo, index) => (
                              <div
                                key={index}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl cursor-pointer bg-muted"
                              >
                                <img
                                  src={photo.getDirectURL()}
                                  alt={`${album.name} photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {videoAlbums.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        <h4 className="text-lg font-semibold">Video Albums</h4>
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {videoAlbums.length}
                        </span>
                      </div>
                      {videoAlbums.map((album) => (
                        <div key={album.id} className="space-y-3">
                          <h5 className="text-md font-semibold text-foreground">{album.name}</h5>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {album.videos.map((video, index) => (
                              <div
                                key={index}
                                className="aspect-square rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl cursor-pointer bg-black relative group"
                              >
                                <video
                                  src={video.getDirectURL()}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Video className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {currentUserPrincipal && (
          <div className="mb-8">
            <GradeDeedsRating
              userPrincipal={currentUserPrincipal.toString()}
              isFriend={true}
              onRate={(ratings) => {
                console.log('Rating submitted:', ratings);
              }}
            />
          </div>
        )}

        <Card className="mb-6 bg-white shadow-xl border-border/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Total Posts</p>
                <p className="text-3xl font-extrabold text-primary">{sortedPosts.length}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/5 rounded-xl p-6 border border-pink-500/20">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Total Sparks</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {sortedPosts.reduce((sum, post) => sum + Number(post.likes), 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-xl p-6 border border-cyan-500/20">
                <p className="text-sm text-muted-foreground font-semibold mb-1">Total Comments</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  {sortedPosts.reduce((sum, post) => sum + Number(post.comments), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}

        {showUpdateStatus && (
          <UpdateStatusModal onClose={() => setShowUpdateStatus(false)} />
        )}
      </div>
    </div>
  );
}

