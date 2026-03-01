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
export interface MusicAttachment {
    id: string;
    title: string;
    audioFile: ExternalBlob;
    artist: string;
}
export type Time = bigint;
export interface VideoAlbumView {
    id: string;
    name: string;
    videos: Array<ExternalBlob>;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPhotoToAlbum(albumId: string, photo: ExternalBlob): Promise<boolean>;
    addStatusUpdate(text: string | null, image: ExternalBlob | null, music: MusicAttachment | null): Promise<void>;
    addVideoToAlbum(albumId: string, video: ExternalBlob): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    attachMusicToStatus(musicId: string, title: string, artist: string, audio: ExternalBlob): Promise<void>;
    createPhotoAlbum(albumId: string, albumName: string): Promise<void>;
    createVideoAlbum(albumId: string, albumName: string): Promise<void>;
    getAllMusicAttachments(): Promise<Array<MusicAttachment>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFriendsStatusUpdates(friends: Array<Principal>): Promise<Array<StatusUpdate>>;
    getMusicAttachment(musicId: string): Promise<MusicAttachment | null>;
    getMyPhotoAlbums(): Promise<Array<PhotoAlbumView>>;
    getMyVideoAlbums(): Promise<Array<VideoAlbumView>>;
    getUserAlbums(user: Principal): Promise<{
        photoAlbums: Array<PhotoAlbumView>;
        videoAlbums: Array<VideoAlbumView>;
    }>;
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
    removeMusicAttachment(musicId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
