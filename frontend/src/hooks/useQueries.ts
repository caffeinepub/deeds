import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PostCategory =
  | { __kind__: 'environmental' }
  | { __kind__: 'communityService' }
  | { __kind__: 'actsOfKindness' }
  | { __kind__: 'other' };

export type GradingScale =
  | { __kind__: 'letterGrade' }
  | { __kind__: 'starRating' }
  | { __kind__: 'percentage' };

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserProfile {
  principal: any;
  name: string;
  bio: string;
  profilePicture?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  followers: bigint;
  following: bigint;
  statusText?: { __kind__: 'Some'; value: string } | { __kind__: 'None' };
  statusImage?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  layoutPreferences?: { __kind__: 'Some'; value: string } | { __kind__: 'None' };
}

export interface Post {
  id: string;
  author: any;
  caption: string;
  parentPostId?: { __kind__: 'Some'; value: string } | { __kind__: 'None' };
  photo?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  video?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  category: PostCategory;
  timestamp: bigint;
  likes: bigint;
  comments: bigint;
  isFlagged: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: any;
  content: string;
  timestamp: bigint;
}

export interface Like {
  postId: string;
  user: any;
}

export interface Follow {
  follower: any;
  following: any;
}

export interface Message {
  id: string;
  sender: any;
  receiver: any;
  content: string;
  timestamp: bigint;
}

export interface Notification {
  id: string;
  user: any;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export interface LiveSession {
  id: string;
  broadcaster: any;
  streamId: string;
  timestamp: bigint;
  viewers: bigint;
  isActive: boolean;
}

export interface LiveComment {
  id: string;
  sessionId: string;
  author: any;
  content: string;
  timestamp: bigint;
}

export interface Blog {
  id: string;
  author: any;
  title: string;
  content: string;
  media: any[];
  categories: string[];
  tags: string[];
  timestamp: bigint;
  isLive: boolean;
  likes: bigint;
  comments: bigint;
}

export type MarketplaceCategory =
  | { __kind__: 'environment' }
  | { __kind__: 'education' }
  | { __kind__: 'communitySupport' }
  | { __kind__: 'animalWelfare' }
  | { __kind__: 'emotionalSupport' }
  | { __kind__: 'other' };

export type Variant_offer_need = { __kind__: 'need' } | { __kind__: 'offer' };

export interface MarketplacePost {
  id: string;
  author: any;
  title: string;
  category: MarketplaceCategory;
  description: string;
  location: string;
  contactMethod: string;
  media?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  postType: Variant_offer_need;
  timestamp: bigint;
  views: bigint;
  savedCount: bigint;
}

export interface PhotoAlbumView {
  id: string;
  name: string;
  photos: any[];
}

export interface VideoAlbumView {
  id: string;
  name: string;
  videos: any[];
}

export interface MusicAttachment {
  id: string;
  title: string;
  artist: string;
  audioFile: any;
}

export interface StatusUpdate {
  text?: { __kind__: 'Some'; value: string } | { __kind__: 'None' };
  image?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  timestamp: bigint;
  music?: { __kind__: 'Some'; value: MusicAttachment } | { __kind__: 'None' };
}

export interface Achievement {
  id: string;
  user: any;
  name: string;
  description: string;
  badgeType: any;
  icon?: { __kind__: 'Some'; value: any } | { __kind__: 'None' };
  isUnlocked: boolean;
  unlockTimestamp?: { __kind__: 'Some'; value: bigint } | { __kind__: 'None' };
}

export interface LoveNote {
  id: string;
  sender: any;
  recipient: any;
  message: string;
  timestamp: bigint;
}

export interface DailyChallenge {
  id: string;
  prompt: string;
  category: PostCategory;
  date: bigint;
}

export interface KindnessMatch {
  withUser: any;
  sharedCategories: PostCategory[];
  compatibilityScore: bigint;
  reason: string;
}

export interface MemoryJarEntry {
  postId: string;
  savedAt: bigint;
  isPublic: boolean;
}

export interface ProfileReportCard {
  postsCount: bigint;
  deedsCompleted: bigint;
  likesReceived: bigint;
  weekStart: bigint;
  gradingScale: GradingScale;
  isPublic: boolean;
  scores: Array<{ value: number; timestamp: bigint }>;
  grade?: { __kind__: 'Some'; value: { value: number; timestamp: bigint } } | { __kind__: 'None' };
}

// ─── User Profile Hooks ───────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await (actor as any).getCallerUserProfile();
      if (result === null || result === undefined) return null;
      if (Array.isArray(result) && result.length === 0) return null;
      if (Array.isArray(result) && result.length > 0) return result[0] as UserProfile;
      return result as UserProfile;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const result = await (actor as any).getUserProfile(principal);
      if (result === null || result === undefined) return null;
      if (Array.isArray(result) && result.length === 0) return null;
      if (Array.isArray(result) && result.length > 0) return result[0] as UserProfile;
      return result as UserProfile;
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<UserProfile> & { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pictureBlob: any) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).updateProfilePicture(pictureBlob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Post Hooks ───────────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllPosts();
      return result as Post[];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserPosts(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getUserPosts(principal);
      return result as Post[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: {
      caption: string;
      category: PostCategory;
      photo?: any;
      video?: any;
      parentPostId?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createPost(postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

export function useGetRippleChain(postId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['rippleChain', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      const result = await (actor as any).getRippleChain(postId);
      return (result as unknown) as Post[];
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

// ─── Comment Hooks ────────────────────────────────────────────────────────────

export function useGetPostComments(postId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      const result = await (actor as any).getPostComments(postId);
      return result as Comment[];
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useCreateComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createComment({ postId, content });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// ─── Follow Hooks ─────────────────────────────────────────────────────────────

export function useGetFollowers(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Follow[]>({
    queryKey: ['followers', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getFollowers(principal);
      return result as Follow[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useGetFollowing(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Follow[]>({
    queryKey: ['following', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getFollowing(principal);
      return result as Follow[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).followUser(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).unfollowUser(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Message Hooks ────────────────────────────────────────────────────────────

export function useGetMessages(otherPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', otherPrincipal],
    queryFn: async () => {
      if (!actor || !otherPrincipal) return [];
      const result = await (actor as any).getMessages(otherPrincipal);
      return result as Message[];
    },
    enabled: !!actor && !actorFetching && !!otherPrincipal,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).sendMessage({ receiver, content });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver] });
    },
  });
}

// ─── Notification Hooks ───────────────────────────────────────────────────────

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getNotifications();
      return result as Notification[];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).markNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Live Session Hooks ───────────────────────────────────────────────────────

export function useGetLiveSessions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LiveSession[]>({
    queryKey: ['liveSessions'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getLiveSessions();
      return result as LiveSession[];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useStartLiveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: { streamId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return await (actor as any).startLiveSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
    },
  });
}

export function useEndLiveSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).endLiveSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
    },
  });
}

export function useGetLiveComments(sessionId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LiveComment[]>({
    queryKey: ['liveComments', sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return [];
      const result = await (actor as any).getLiveComments(sessionId);
      return result as LiveComment[];
    },
    enabled: !!actor && !actorFetching && !!sessionId,
    refetchInterval: 3000,
  });
}

export function useAddLiveComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).addLiveComment({ sessionId, content });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['liveComments', variables.sessionId] });
    },
  });
}

// ─── Blog Hooks ───────────────────────────────────────────────────────────────

export function useGetAllBlogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Blog[]>({
    queryKey: ['blogs'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllBlogs();
      return result as Blog[];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateBlog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogData: {
      title: string;
      content: string;
      categories: string[];
      tags: string[];
      isLive: boolean;
      media: any[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createBlog(blogData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

// ─── Marketplace Hooks ────────────────────────────────────────────────────────

export function useGetMarketplacePosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarketplacePost[]>({
    queryKey: ['marketplacePosts'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getMarketplacePosts();
      return result as MarketplacePost[];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateMarketplacePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: {
      title: string;
      category: MarketplaceCategory;
      description: string;
      location: string;
      contactMethod: string;
      media?: any;
      postType: Variant_offer_need;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createMarketplacePost(postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplacePosts'] });
    },
  });
}

export function useSaveMarketplacePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).saveMarketplacePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedMarketplacePosts'] });
    },
  });
}

// ─── Album Hooks ──────────────────────────────────────────────────────────────

export function useGetPhotoAlbums(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhotoAlbumView[]>({
    queryKey: ['photoAlbums', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getPhotoAlbums(principal);
      return result as PhotoAlbumView[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useCreatePhotoAlbum() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, photos }: { name: string; photos: any[] }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createPhotoAlbum({ name, photos });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoAlbums'] });
    },
  });
}

// ─── Status Update Hooks ──────────────────────────────────────────────────────

export function useGetStatusUpdates(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StatusUpdate[]>({
    queryKey: ['statusUpdates', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getStatusUpdates(principal);
      return result as StatusUpdate[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useGetAllFriendsStatusUpdates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{ user: any; status: StatusUpdate }>>({
    queryKey: ['allFriendsStatusUpdates'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllFriendsStatusUpdates();
      return result as Array<{ user: any; status: StatusUpdate }>;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStatusUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statusData: {
      text?: string;
      image?: any;
      music?: any;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).createStatusUpdate(statusData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statusUpdates'] });
      queryClient.invalidateQueries({ queryKey: ['allFriendsStatusUpdates'] });
    },
  });
}

// ─── Achievement Hooks ────────────────────────────────────────────────────────

export function useGetAchievements(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Achievement[]>({
    queryKey: ['achievements', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getAchievements(principal);
      return result as Achievement[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ─── Love Note Hooks ──────────────────────────────────────────────────────────

export function useGetLoveNotes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LoveNote[]>({
    queryKey: ['loveNotes'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getLoveNotes();
      return result as LoveNote[];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSendLoveNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, message }: { recipient: string; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).sendLoveNote({ recipient, message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveNotes'] });
    },
  });
}

// ─── Daily Challenge Hooks ────────────────────────────────────────────────────

export function useGetDailyChallenge() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyChallenge | null>({
    queryKey: ['dailyChallenge'],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getDailyChallenge();
      if (!result || (Array.isArray(result) && result.length === 0)) return null;
      if (Array.isArray(result)) return result[0] as DailyChallenge;
      return result as DailyChallenge;
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Kindness Match Hooks ─────────────────────────────────────────────────────

export function useGetKindnessMatches() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<KindnessMatch[]>({
    queryKey: ['kindnessMatches'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getKindnessMatches();
      return result as KindnessMatch[];
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Memory Jar Hooks ─────────────────────────────────────────────────────────

export function useGetMemoryJar() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MemoryJarEntry[]>({
    queryKey: ['memoryJar'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getMemoryJar();
      return result as MemoryJarEntry[];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserMemoryJar(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MemoryJarEntry[]>({
    queryKey: ['userMemoryJar', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      const result = await (actor as any).getUserMemoryJar(principal);
      return result as MemoryJarEntry[];
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useSaveToMemoryJar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).saveToMemoryJar(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryJar'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useRemoveFromMemoryJar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).removeFromMemoryJar(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryJar'] });
    },
  });
}

export function useUpdateMemoryJarVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isPublic }: { postId: string; isPublic: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).updateMemoryJarEntryVisibility(postId, isPublic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryJar'] });
    },
  });
}

// ─── Report Card Hooks ────────────────────────────────────────────────────────

export function useGetProfileReportCard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ProfileReportCard | null>({
    queryKey: ['profileReportCard'],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getProfileReportCard();
      if (!result || (Array.isArray(result) && result.length === 0)) return null;
      if (Array.isArray(result)) return result[0] as ProfileReportCard;
      return result as ProfileReportCard;
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateReportCardGradingScale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scale: GradingScale) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).updateReportCardGradingScale(scale);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileReportCard'] });
    },
  });
}

export function useUpdateReportCardVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isPublic: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await (actor as any).updateReportCardVisibility(isPublic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileReportCard'] });
    },
  });
}

// ─── Admin Hooks ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return await (actor as any).isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useHealthcheck() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['healthcheck'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        await (actor as any).healthcheckWithPhotos();
        return true;
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}
