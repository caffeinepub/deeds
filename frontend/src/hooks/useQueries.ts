import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import type { UserProfile, PhotoAlbumView, VideoAlbumView, MusicAttachment, StatusUpdate, LoveNote, DailyChallenge, ChallengeCompletion, KindnessMatch, MemoryJarEntry } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) throw new Error('Actor or user principal not available');
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useGetUserAlbums(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<{ photoAlbums: PhotoAlbumView[]; videoAlbums: VideoAlbumView[] }>({
    queryKey: ['userAlbums', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) throw new Error('Actor or user principal not available');
      return actor.getUserAlbums(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useGetFriendsStatusUpdates(friends: Principal[]) {
  const { actor, isFetching } = useActor();

  return useQuery<StatusUpdate[]>({
    queryKey: ['friendsStatusUpdates', friends.map(f => f.toString()).join(',')],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (friends.length === 0) return [];
      return actor.getFriendsStatusUpdates(friends);
    },
    enabled: !!actor && !isFetching && friends.length > 0,
  });
}

export function useAttachMusicToStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ musicId, title, artist, audio }: { musicId: string; title: string; artist: string; audio: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.attachMusicToStatus(musicId, title, artist, audio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['musicAttachments'] });
    },
  });
}

export function useGetAllMusicAttachments() {
  const { actor, isFetching } = useActor();

  return useQuery<MusicAttachment[]>({
    queryKey: ['musicAttachments'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllMusicAttachments();
    },
    enabled: !!actor && !isFetching,
  });
}

export type PostCategory = 
  | { __kind__: 'environmental' }
  | { __kind__: 'communityService' }
  | { __kind__: 'actsOfKindness' }
  | { __kind__: 'other' };

export interface Post {
  id: string;
  author: Principal;
  caption: string;
  parentPostId?: string;
  photo: any;
  video: any;
  category: PostCategory;
  timestamp: bigint;
  likes: bigint;
  comments: bigint;
  isFlagged: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: Principal;
  content: string;
  timestamp: bigint;
}

export interface Blog {
  id: string;
  author: Principal;
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

export interface LiveSession {
  id: string;
  broadcaster: Principal;
  streamId: string;
  timestamp: bigint;
  viewers: bigint;
  isActive: boolean;
}

export interface LiveComment {
  id: string;
  sessionId: string;
  author: Principal;
  content: string;
  timestamp: bigint;
}

export interface Notification {
  id: string;
  user: Principal;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export interface Follow {
  follower: Principal;
  following: Principal;
}

export interface Message {
  id: string;
  sender: Principal;
  receiver: Principal;
  content: string;
  timestamp: bigint;
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
  author: Principal;
  title: string;
  category: MarketplaceCategory;
  description: string;
  location: string;
  contactMethod: string;
  media: any;
  postType: Variant_offer_need;
  timestamp: bigint;
  views: bigint;
  savedCount: bigint;
}

export function useGetAllPosts() {
  return useQuery<Post[]>({
    queryKey: ['allPosts'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: { caption: string; parentPostId?: string; photo?: any; video?: any; category: PostCategory }) => {
      if (!actor) throw new Error('Actor not available');
      const id = `post-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const categoryStr = post.category.__kind__ as any;
      return actor.createPost(
        id,
        post.caption,
        post.parentPostId ?? null,
        post.photo ?? null,
        post.video ?? null,
        categoryStr
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['rippleChain'] });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_postId: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });
}

export function useGetComments(postId: string) {
  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetAllBlogs() {
  return useQuery<Blog[]>({
    queryKey: ['allBlogs'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_blog: Partial<Blog>) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBlogs'] });
    },
  });
}

export function useSearchBlogs(_query: string) {
  return useQuery<Blog[]>({
    queryKey: ['searchBlogs', _query],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetFollowers(userPrincipal: Principal | null) {
  return useQuery<Follow[]>({
    queryKey: ['followers', userPrincipal?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetFollowing(userPrincipal: Principal | null) {
  return useQuery<Follow[]>({
    queryKey: ['following', userPrincipal?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_notificationId: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_message: Partial<Message>) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useGetActiveLiveSessions() {
  return useQuery<LiveSession[]>({
    queryKey: ['activeLiveSessions'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_session: Partial<LiveSession>) => {
      return Promise.resolve({ id: 'session-1', streamId: 'stream-1' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLiveSessions'] });
    },
  });
}

export function useEndLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_sessionId: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeLiveSessions'] });
    },
  });
}

export function useGetLiveComments(sessionId: string) {
  return useQuery<LiveComment[]>({
    queryKey: ['liveComments', sessionId],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateLiveComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: Partial<LiveComment>) => {
      return Promise.resolve();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['liveComments', variables.sessionId] });
    },
  });
}

export function useGetAllMarketplacePosts() {
  return useQuery<MarketplacePost[]>({
    queryKey: ['marketplacePosts'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useCreateMarketplacePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_post: Partial<MarketplacePost>) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplacePosts'] });
    },
  });
}

// ── Ripple Effect Stories ─────────────────────────────────────────────────────

export function useGetRippleChain(postId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['rippleChain', postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      // Cast via unknown to bridge the backend PostCategory enum vs local discriminated union
      const result = await actor.getRippleChain(postId);
      return result as unknown as Post[];
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

// ── Love Notes ────────────────────────────────────────────────────────────────

export function useSendLoveNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, message }: { recipient: Principal; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      const id = `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return actor.sendLoveNote(id, recipient, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLoveNotes'] });
      queryClient.invalidateQueries({ queryKey: ['loveNotesCount'] });
    },
  });
}

export function useGetMyLoveNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<LoveNote[]>({
    queryKey: ['myLoveNotes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyLoveNotes();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetLoveNotesCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['loveNotesCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getLoveNotesCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Deed of the Day ───────────────────────────────────────────────────────────

export function useGetTodaysChallenge() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyChallenge | null>({
    queryKey: ['todaysChallenge'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTodaysChallenge();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetChallengeCompletions(challengeId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ChallengeCompletion[]>({
    queryKey: ['challengeCompletions', challengeId],
    queryFn: async () => {
      if (!actor || !challengeId) return [];
      return actor.getChallengeCompletions(challengeId);
    },
    enabled: !!actor && !isFetching && !!challengeId,
    refetchInterval: 10000,
  });
}

export function useGetUserChallengeCompletions(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ChallengeCompletion[]>({
    queryKey: ['userChallengeCompletions', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getUserChallengeCompletions(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useCompleteDailyChallenge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ challengeId, postId }: { challengeId: string; postId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeDailyChallenge(challengeId, postId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['challengeCompletions', variables.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['userChallengeCompletions'] });
    },
  });
}

// ── Kindness Matches ──────────────────────────────────────────────────────────

export function useGetTopMatches(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<KindnessMatch[]>({
    queryKey: ['topMatches', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      return actor.getTopMatches(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

// ── Memory Jar ────────────────────────────────────────────────────────────────

export function useGetMyMemoryJar() {
  const { actor, isFetching } = useActor();

  return useQuery<MemoryJarEntry[]>({
    queryKey: ['myMemoryJar'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyMemoryJar();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToMemoryJar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToMemoryJar(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMemoryJar'] });
    },
  });
}

export function useRemoveFromMemoryJar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeFromMemoryJar(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMemoryJar'] });
    },
  });
}
