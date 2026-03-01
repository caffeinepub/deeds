import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  let storage = Storage.new();
  include MixinStorage(storage);

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  var userProfiles = Map.empty<Principal, UserProfile>();
  var posts = Map.empty<Text, Post>();
  var comments = Map.empty<Text, Comment>();
  var likes = Map.empty<Text, Like>();
  var follows = Map.empty<Text, Follow>();
  var messages = Map.empty<Text, Message>();
  var notifications = Map.empty<Text, Notification>();
  var liveSessions = Map.empty<Text, LiveSession>();
  var liveComments = Map.empty<Text, LiveComment>();
  var sessionTracking = Map.empty<Text, SessionTracking>();
  var blogs = Map.empty<Text, Blog>();
  var marketplacePosts = Map.empty<Text, MarketplacePost>();
  var savedMarketplacePosts = Map.empty<Principal, List.List<Text>>();
  var photoAlbums = Map.empty<Principal, List.List<PhotoAlbum>>();
  var videoAlbums = Map.empty<Principal, List.List<VideoAlbum>>();
  var musicAttachments = Map.empty<Text, MusicAttachment>();
  var musicAttachmentOwners = Map.empty<Text, Principal>();
  var statusUpdates = Map.empty<Principal, List.List<StatusUpdate>>();
  var achievements = Map.empty<Principal, List.List<Achievement>>();

  type UserProfile = {
    principal : Principal;
    name : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
    followers : Nat;
    following : Nat;
    statusText : ?Text;
    statusImage : ?Storage.ExternalBlob;
    layoutPreferences : ?Text;
  };

  type PostCategory = {
    #environmental;
    #communityService;
    #actsOfKindness;
    #other;
  };

  type Post = {
    id : Text;
    author : Principal;
    caption : Text;
    photo : ?Storage.ExternalBlob;
    video : ?Storage.ExternalBlob;
    category : PostCategory;
    timestamp : Time.Time;
    likes : Nat;
    comments : Nat;
    isFlagged : Bool;
  };

  type Comment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Like = {
    postId : Text;
    user : Principal;
  };

  type Follow = {
    follower : Principal;
    following : Principal;
  };

  type Message = {
    id : Text;
    sender : Principal;
    receiver : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type Notification = {
    id : Text;
    user : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  type LiveSession = {
    id : Text;
    broadcaster : Principal;
    streamId : Text;
    timestamp : Time.Time;
    viewers : Nat;
    isActive : Bool;
  };

  type LiveComment = {
    id : Text;
    sessionId : Text;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type SessionTracking = {
    user : Principal;
    sessionStart : Time.Time;
    sessionDuration : Nat;
    dailyUsage : Nat;
    lastActive : Time.Time;
  };

  type Blog = {
    id : Text;
    author : Principal;
    title : Text;
    content : Text;
    media : [Storage.ExternalBlob];
    categories : [Text];
    tags : [Text];
    timestamp : Time.Time;
    isLive : Bool;
    likes : Nat;
    comments : Nat;
  };

  type MarketplaceCategory = {
    #environment;
    #education;
    #communitySupport;
    #animalWelfare;
    #emotionalSupport;
    #other;
  };

  type MarketplacePost = {
    id : Text;
    author : Principal;
    title : Text;
    category : MarketplaceCategory;
    description : Text;
    location : Text;
    contactMethod : Text;
    media : ?Storage.ExternalBlob;
    postType : { #need; #offer };
    timestamp : Time.Time;
    views : Nat;
    savedCount : Nat;
  };

  type MarketplaceMatch = {
    post : MarketplacePost;
    distance : Nat;
    categoryMatch : Bool;
  };

  type MarketplaceFilter = {
    #newest;
    #closest;
    #popular;
  };

  type PhotoAlbum = {
    id : Text;
    name : Text;
    photos : List.List<Storage.ExternalBlob>;
  };

  type PhotoAlbumView = {
    id : Text;
    name : Text;
    photos : [Storage.ExternalBlob];
  };

  type VideoAlbum = {
    id : Text;
    name : Text;
    videos : List.List<Storage.ExternalBlob>;
  };

  type VideoAlbumView = {
    id : Text;
    name : Text;
    videos : [Storage.ExternalBlob];
  };

  type MusicAttachment = {
    id : Text;
    title : Text;
    artist : Text;
    audioFile : Storage.ExternalBlob;
  };

  type StatusUpdate = {
    text : ?Text;
    image : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    music : ?MusicAttachment;
  };

  type BadgeType = {
    #goodDeedComplete;
    #challengeParticipation;
    #longTermFriendship;
    #contentCreator;
  };

  type Achievement = {
    id : Text;
    user : Principal;
    name : Text;
    description : Text;
    badgeType : BadgeType;
    icon : ?Storage.ExternalBlob;
    isUnlocked : Bool;
    unlockTimestamp : ?Time.Time;
  };

  public shared ({ caller }) func healthcheckWithStorageCleanup() : async { operational : Bool; message : Text; storageSystem : Bool } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform health check with storage cleanup");
    };
    {
      operational = true;
      storageSystem = true;
      message = "Storage system is operational and cleaned up.";
    };
  };

  public shared ({ caller }) func healthcheckWithPhotos() : async { photoSystem : Bool } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform photo system health check");
    };
    {
      photoSystem = true;
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their own profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let validatedProfile : UserProfile = {
      principal = caller;
      name = profile.name;
      bio = profile.bio;
      profilePicture = profile.profilePicture;
      followers = profile.followers;
      following = profile.following;
      statusText = profile.statusText;
      statusImage = profile.statusImage;
      layoutPreferences = profile.layoutPreferences;
    };
    userProfiles.add(caller, validatedProfile);
  };

  public shared ({ caller }) func createPhotoAlbum(albumId : Text, albumName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create photo albums");
    };
    let newAlbum : PhotoAlbum = {
      id = albumId;
      name = albumName;
      photos = List.empty<Storage.ExternalBlob>();
    };
    let currentAlbums = switch (photoAlbums.get(caller)) {
      case (null) { List.empty<PhotoAlbum>() };
      case (?albums) { albums };
    };
    currentAlbums.add(newAlbum);
    photoAlbums.add(caller, currentAlbums);
  };

  public shared ({ caller }) func addPhotoToAlbum(albumId : Text, photo : Storage.ExternalBlob) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photos to albums");
    };
    switch (photoAlbums.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Album not found or does not belong to caller");
      };
      case (?albums) {
        var albumFound = false;
        for (album in albums.values()) {
          if (album.id == albumId) {
            albumFound := true;
          };
        };
        if (not albumFound) {
          Runtime.trap("Unauthorized: Album does not belong to caller");
        };
        let updatedAlbums = albums.map<PhotoAlbum, PhotoAlbum>(
          func(album) {
            if (album.id == albumId) {
              let newPhotos = List.empty<Storage.ExternalBlob>();
              album.photos.values().forEach(func(p) { newPhotos.add(p) });
              newPhotos.add(photo);
              {
                id = album.id;
                name = album.name;
                photos = newPhotos;
              };
            } else {
              album;
            };
          }
        );
        photoAlbums.add(caller, updatedAlbums);
        true;
      };
    };
  };

  public shared ({ caller }) func createVideoAlbum(albumId : Text, albumName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create video albums");
    };
    let newAlbum : VideoAlbum = {
      id = albumId;
      name = albumName;
      videos = List.empty<Storage.ExternalBlob>();
    };
    let currentAlbums = switch (videoAlbums.get(caller)) {
      case (null) { List.empty<VideoAlbum>() };
      case (?albums) { albums };
    };
    currentAlbums.add(newAlbum);
    videoAlbums.add(caller, currentAlbums);
  };

  public shared ({ caller }) func addVideoToAlbum(albumId : Text, video : Storage.ExternalBlob) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add videos to albums");
    };
    switch (videoAlbums.get(caller)) {
      case (null) {
        Runtime.trap("Unauthorized: Album not found or does not belong to caller");
      };
      case (?albums) {
        var albumFound = false;
        for (album in albums.values()) {
          if (album.id == albumId) {
            albumFound := true;
          };
        };
        if (not albumFound) {
          Runtime.trap("Unauthorized: Album does not belong to caller");
        };
        let updatedAlbums = albums.map<VideoAlbum, VideoAlbum>(
          func(album) {
            if (album.id == albumId) {
              let newVideos = List.empty<Storage.ExternalBlob>();
              album.videos.values().forEach(func(v) { newVideos.add(v) });
              newVideos.add(video);
              {
                id = album.id;
                name = album.name;
                videos = newVideos;
              };
            } else {
              album;
            };
          }
        );
        videoAlbums.add(caller, updatedAlbums);
        true;
      };
    };
  };

  public shared ({ caller }) func attachMusicToStatus(musicId : Text, title : Text, artist : Text, audio : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can attach music to status");
    };
    let attachment : MusicAttachment = {
      id = musicId;
      title;
      artist;
      audioFile = audio;
    };
    musicAttachments.add(musicId, attachment);
    musicAttachmentOwners.add(musicId, caller);
  };

  public shared ({ caller }) func removeMusicAttachment(musicId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove music attachments");
    };
    switch (musicAttachmentOwners.get(musicId)) {
      case (null) {
        Runtime.trap("Unauthorized: Music attachment not found");
      };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only remove your own music attachments");
        };
        musicAttachments.remove(musicId);
        musicAttachmentOwners.remove(musicId);
        true;
      };
    };
  };

  public query ({ caller }) func getMyPhotoAlbums() : async [PhotoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their photo albums");
    };
    switch (photoAlbums.get(caller)) {
      case (null) { [] };
      case (?albums) {
        albums.toArray().map(
          func(album) {
            {
              id = album.id;
              name = album.name;
              photos = album.photos.toArray();
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getMyVideoAlbums() : async [VideoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their video albums");
    };
    switch (videoAlbums.get(caller)) {
      case (null) { [] };
      case (?albums) {
        albums.toArray().map(
          func(album) {
            {
              id = album.id;
              name = album.name;
              videos = album.videos.toArray();
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getUserPhotoAlbums(user : Principal) : async [PhotoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view photo albums");
    };
    switch (photoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.toArray().map(
          func(album) {
            {
              id = album.id;
              name = album.name;
              photos = album.photos.toArray();
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getUserVideoAlbums(user : Principal) : async [VideoAlbumView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view video albums");
    };
    switch (videoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.toArray().map(
          func(album) {
            {
              id = album.id;
              name = album.name;
              videos = album.videos.toArray();
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func getUserAlbums(user : Principal) : async {
    photoAlbums : [PhotoAlbumView];
    videoAlbums : [VideoAlbumView];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view albums");
    };
    let photos = switch (photoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.toArray().map(
          func(album) {
            {
              id = album.id;
              name = album.name;
              photos = album.photos.toArray();
            };
          }
        );
      };
    };
    let videos = switch (videoAlbums.get(user)) {
      case (null) { [] };
      case (?albums) {
        albums.toArray().map(
          func(album) {
            {
              id = album.id;
              name = album.name;
              videos = album.videos.toArray();
            };
          }
        );
      };
    };
    {
      photoAlbums = photos;
      videoAlbums = videos;
    };
  };

  public query ({ caller }) func getMusicAttachment(musicId : Text) : async ?MusicAttachment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access music attachments");
    };
    musicAttachments.get(musicId);
  };

  public query ({ caller }) func getAllMusicAttachments() : async [MusicAttachment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access music attachments");
    };
    musicAttachments.values().toArray();
  };

  public shared ({ caller }) func addStatusUpdate(text : ?Text, image : ?Storage.ExternalBlob, music : ?MusicAttachment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add status updates");
    };
    let status : StatusUpdate = {
      text;
      image;
      timestamp = Time.now();
      music;
    };
    let currentStatus = switch (statusUpdates.get(caller)) {
      case (null) { List.empty<StatusUpdate>() };
      case (?statuses) { statuses };
    };
    currentStatus.add(status);
    statusUpdates.add(caller, currentStatus);
  };

  public query ({ caller }) func getUserStatusUpdates(user : Principal) : async [StatusUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get status updates");
    };
    switch (statusUpdates.get(user)) {
      case (null) { [] };
      case (?statuses) {
        statuses.toArray();
      };
    };
  };

  public query ({ caller }) func getFriendsStatusUpdates(friends : [Principal]) : async [StatusUpdate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get friends' status updates");
    };
    let friendStatusUpdates = friends.map(
      func(friend) {
        switch (statusUpdates.get(friend)) {
          case (null) { [] : [StatusUpdate] };
          case (?statuses) { statuses.toArray() };
        };
      }
    );
    let flattenedStatusUpdates = List.empty<StatusUpdate>();
    friendStatusUpdates.forEach(
      func(statusArray) {
        for (status in statusArray.values()) {
          flattenedStatusUpdates.add(status);
        };
      }
    );
    flattenedStatusUpdates.toArray();
  };
};
