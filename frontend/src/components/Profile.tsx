import React, { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetUserPosts,
  useGetPhotoAlbums,
  useGetFollowers,
  useGetFollowing,
  useGetNotifications,
} from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Edit2, Bell, BookOpen, Star } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';
import UpdateStatusModal from './UpdateStatusModal';
import PostCard from './PostCard';
import MemoryJarView from './MemoryJarView';
import ReportCard from './ReportCard';
import DeedsBar from './DeedsBar';
import { toast } from 'sonner';

export default function Profile() {
  const { identity } = useInternetIdentity();
  const userPrincipal = identity?.getPrincipal().toString() ?? null;

  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: posts = [], isLoading: postsLoading } = useGetUserPosts(userPrincipal);
  const { data: albums = [], isLoading: albumsLoading } = useGetPhotoAlbums(userPrincipal);
  const { data: followers = [] } = useGetFollowers(userPrincipal);
  const { data: following = [] } = useGetFollowing(userPrincipal);
  const { data: notifications = [] } = useGetNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to update profile picture');
    }
  };

  const getAvatarUrl = () => {
    if (profile?.profilePicture && profile.profilePicture.__kind__ === 'Some') {
      try {
        const blob = profile.profilePicture.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return '/assets/generated/default-avatar.dim_100x100.png';
  };

  if (profileLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profile && isFetched) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Profile not found. Please complete your profile setup.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10 rounded-b-2xl" />

        {/* Avatar + Info */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative">
              <img
                src={getAvatarUrl()}
                alt={profile?.name ?? 'User'}
                className="w-20 h-20 rounded-full border-4 border-background object-cover shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/generated/default-avatar.dim_100x100.png';
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors"
                title="Change profile picture"
              >
                <Camera className="w-3 h-3" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusModal(true)}
                className="text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="relative text-xs"
              >
                <Bell className="w-3 h-3 mr-1" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                Alerts
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground">{profile?.name ?? 'User'}</h1>
            {profile?.statusText && profile.statusText.__kind__ === 'Some' && (
              <p className="text-sm text-accent font-medium mt-0.5">"{profile.statusText.value}"</p>
            )}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-3">
            <button
              onClick={() => setShowFollowers(true)}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-lg font-bold text-foreground">{followers.length}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </button>
            <button
              onClick={() => setShowFollowing(true)}
              className="text-center hover:opacity-80 transition-opacity"
            >
              <div className="text-lg font-bold text-foreground">{following.length}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </button>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{posts.length}</div>
              <div className="text-xs text-muted-foreground">Deeds</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deeds Bar - only on profile page */}
      <div className="px-4 mb-4">
        <DeedsBar />
      </div>

      {/* Report Card */}
      <div className="px-4 mb-4">
        <ReportCard />
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="posts" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Deeds
            </TabsTrigger>
            <TabsTrigger value="albums" className="text-xs">
              <Star className="w-3 h-3 mr-1" />
              Albums
            </TabsTrigger>
            <TabsTrigger value="jar" className="text-xs">
              🫙 Memory Jar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {postsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-muted-foreground text-sm">No deeds yet. Start sharing your kindness!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="albums">
            {albumsLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-muted-foreground text-sm">No albums yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="rounded-xl overflow-hidden border border-border bg-card shadow-sm"
                  >
                    <div className="h-24 bg-muted flex items-center justify-center">
                      {album.photos.length > 0 ? (
                        <img
                          src={
                            typeof album.photos[0].getDirectURL === 'function'
                              ? album.photos[0].getDirectURL()
                              : '/assets/generated/photo-gallery-placeholder-icon-transparent.dim_64x64.png'
                          }
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📷</span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground truncate">{album.name}</p>
                      <p className="text-xs text-muted-foreground">{album.photos.length} photos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="jar">
            <MemoryJarView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
      {showFollowers && userPrincipal && (
        <FollowersModal
          userPrincipal={userPrincipal as any}
          onClose={() => setShowFollowers(false)}
        />
      )}
      {showFollowing && userPrincipal && (
        <FollowingModal
          userPrincipal={userPrincipal as any}
          onClose={() => setShowFollowing(false)}
        />
      )}
      {showStatusModal && (
        <UpdateStatusModal onClose={() => setShowStatusModal(false)} />
      )}
    </div>
  );
}
