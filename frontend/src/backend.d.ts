import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface MemoryJarEntry {
    savedAt: Time;
    postId: string;
}
export interface StatusUpdate {
    music?: MusicAttachment;
    text?: string;
    timestamp: Time;
    image?: ExternalBlob;
}
export interface PhotoAlbumView {
    id: string;
    name: string;
    photos: Array<ExternalBlob>;
}
export interface ChallengeCompletion {
    id: string;
    user: Principal;
    challengeId: string;
    timestamp: Time;
    postId: string;
}
export interface VideoAlbumView {
    id: string;
    name: string;
    videos: Array<ExternalBlob>;
}
export interface LoveNote {
    id: string;
    recipient: Principal;
    sender: Principal;
    message: string;
    timestamp: Time;
}
export interface Post {
    id: string;
    parentPostId?: string;
    video?: ExternalBlob;
    author: Principal;
    likes: bigint;
    timestamp: Time;
    caption: string;
    category: PostCategory;
    comments: bigint;
    photo?: ExternalBlob;
    isFlagged: boolean;
}
export interface KindnessMatch {
    sharedCategories: Array<PostCategory>;
    withUser: Principal;
    compatibilityScore: bigint;
    reason: string;
}
export interface DailyChallenge {
    id: string;
    date: Time;
    category: PostCategory;
    prompt: string;
}
export interface MusicAttachment {
    id: string;
    title: string;
    audioFile: ExternalBlob;
    artist: string;
}
export interface UserProfile {
    bio: string;
    principal: Principal;
    statusImage?: ExternalBlob;
    name: string;
    layoutPreferences?: string;
    statusText?: string;
    followers: bigint;
    following: bigint;
    profilePicture?: ExternalBlob;
}
export enum PostCategory {
    other = "other",
    actsOfKindness = "actsOfKindness",
    environmental = "environmental",
    communityService = "communityService"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhotoToAlbum(albumId: string, photo: ExternalBlob): Promise<boolean>;
    addStatusUpdate(text: string | null, image: ExternalBlob | null, music: MusicAttachment | null): Promise<void>;
    addToMemoryJar(postId: string): Promise<boolean>;
    addVideoToAlbum(albumId: string, video: ExternalBlob): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    attachMusicToStatus(musicId: string, title: string, artist: string, audio: ExternalBlob): Promise<void>;
    completeDailyChallenge(challengeId: string, postId: string): Promise<ChallengeCompletion>;
    createPhotoAlbum(albumId: string, albumName: string): Promise<void>;
    createPost(id: string, caption: string, parentPostId: string | null, photo: ExternalBlob | null, video: ExternalBlob | null, category: PostCategory): Promise<Post>;
    createVideoAlbum(albumId: string, albumName: string): Promise<void>;
    getAllMusicAttachments(): Promise<Array<MusicAttachment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChallengeCompletions(challengeId: string): Promise<Array<ChallengeCompletion>>;
    getFriendsStatusUpdates(friends: Array<Principal>): Promise<Array<StatusUpdate>>;
    getLoveNotesCount(): Promise<bigint>;
    getMusicAttachment(musicId: string): Promise<MusicAttachment | null>;
    getMyLoveNotes(): Promise<Array<LoveNote>>;
    getMyMemoryJar(): Promise<Array<MemoryJarEntry>>;
    getMyPhotoAlbums(): Promise<Array<PhotoAlbumView>>;
    getMyVideoAlbums(): Promise<Array<VideoAlbumView>>;
    getRippleChain(postId: string): Promise<Array<Post>>;
    getTodaysChallenge(): Promise<DailyChallenge | null>;
    getTopMatches(user: Principal): Promise<Array<KindnessMatch>>;
    getUserAlbums(user: Principal): Promise<{
        photoAlbums: Array<PhotoAlbumView>;
        videoAlbums: Array<VideoAlbumView>;
    }>;
    getUserChallengeCompletions(user: Principal): Promise<Array<ChallengeCompletion>>;
    getUserPhotoAlbums(user: Principal): Promise<Array<PhotoAlbumView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStatusUpdates(user: Principal): Promise<Array<StatusUpdate>>;
    getUserVideoAlbums(user: Principal): Promise<Array<VideoAlbumView>>;
    healthcheckWithPhotos(): Promise<{
        photoSystem: boolean;
    }>;
    healthcheckWithStorageCleanup(): Promise<{
        storageSystem: boolean;
        operational: boolean;
        message: string;
    }>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeFromMemoryJar(postId: string): Promise<boolean>;
    removeMusicAttachment(musicId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendLoveNote(id: string, recipient: Principal, message: string): Promise<string>;
    setDailyChallenge(id: string, prompt: string, category: PostCategory, date: Time): Promise<DailyChallenge>;
    storeKindnessMatches(user: Principal, matches: Array<KindnessMatch>): Promise<void>;
}
