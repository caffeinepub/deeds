import { useState, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetAllPosts,
  useGetFollowers,
  useGetFollowing,
  useGetNotifications,
  useSaveCallerUserProfile,
  useGetUserAlbums,
  useGetMyMemoryJar,
} from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Separator } from './ui/separator';
import { Loader2, Bell, Edit, Image as ImageIcon, Video, Camera } from 'lucide-react';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';
import NotificationsPanel from './NotificationsPanel';
import UpdateStatusModal from './UpdateStatusModal';
import MemoryJarView from './MemoryJarView';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function Profile() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allPosts, isLoading: postsLoading } = useGetAllPosts();
  const { data: followers } = useGetFollowers(currentUserPrincipal || null);
  const { data: following } = useGetFollowing(currentUserPrincipal || null);
  const { data: notifications } = useGetNotifications();
  const { data: userAlbums } = useGetUserAlbums(currentUserPrincipal || null);
  const { data: memoryJar } = useGetMyMemoryJar();
  const saveProfile = useSaveCallerUserProfile();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const userPosts = allPosts?.filter(
    (post) => post.author.toString() === currentUserPrincipal?.toString()
  ) || [];

  const photoAlbums = userAlbums?.photoAlbums || [];
  const videoAlbums = userAlbums?.videoAlbums || [];
  const jarCount = memoryJar?.length || 0;

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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile || !currentUserPrincipal) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto px-4">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <Avatar className="h-32 w-32">
                {profile.profilePicture && (
                  <AvatarImage
                    src={profile.profilePicture.getDirectURL()}
                    alt={profile.name}
                  />
                )}
                <AvatarFallback className="text-3xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                  disabled={uploadingProfile}
                />
                <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90">
                  {uploadingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
              </label>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.bio || 'No bio yet'}</p>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <div className="font-bold text-xl">{Number(profile.followers)}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </button>
                <button
                  onClick={() => setShowFollowing(true)}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <div className="font-bold text-xl">{Number(profile.following)}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </button>
                <div className="text-center">
                  <div className="font-bold text-xl">{sortedPosts.length}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">{jarCount}</div>
                  <div className="text-sm text-muted-foreground">Saved 🫙</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setShowUpdateStatus(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts ({sortedPosts.length})</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="memory-jar" className="relative">
            Memory Jar 🫙
            {jarCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {jarCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>My Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {sortedPosts.map((post) => (
                    <div key={post.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {post.photo && (
                        <img
                          src={post.photo.getDirectURL()}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {post.video && (
                        <video
                          src={post.video.getDirectURL()}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {!post.photo && !post.video && (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <p className="text-xs line-clamp-3">{post.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="albums">
          {(photoAlbums.length > 0 || videoAlbums.length > 0) ? (
            <Card>
              <CardHeader>
                <CardTitle>Albums</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoAlbums.map((album) => (
                    <div key={album.id} className="space-y-2">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        {album.photos.length > 0 ? (
                          <img
                            src={album.photos[0].getDirectURL()}
                            alt={album.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{album.name}</p>
                        <p className="text-sm text-muted-foreground">{album.photos.length} photos</p>
                      </div>
                    </div>
                  ))}
                  {videoAlbums.map((album) => (
                    <div key={album.id} className="space-y-2">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{album.name}</p>
                        <p className="text-sm text-muted-foreground">{album.videos.length} videos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No albums yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="memory-jar">
          <MemoryJarView />
        </TabsContent>
      </Tabs>

      {showFollowers && (
        <FollowersModal 
          userPrincipal={currentUserPrincipal} 
          onClose={() => setShowFollowers(false)} 
        />
      )}
      {showFollowing && (
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
  );
}
